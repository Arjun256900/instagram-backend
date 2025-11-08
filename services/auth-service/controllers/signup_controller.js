import { adminAuth } from "../../../packages/shared/config/firebase.js";
import Authuser from "../models/auth_user_model.js";
import { publishEvent } from "../../../packages/shared/messaging/rabbitmq.js";

export const signup = async (req, res) => {
  try {
    const { email, password, username, displayName } = req.body;

    // Basic validation
    const validation = Authuser.validate({ email, password, username });
    if (!validation.isValid) {
      return res
        .status(400)
        .json({ error: "Validation error", details: validation.errors });
    }

    // Normalize username for uniqueness checks/storage
    const cleanUsername = username.trim().toLowerCase();

    // 1) Create user in Firebase Auth
    // Auth service will store: email, password, username and uid. We DO NOT store displayName in firebase.
    let userRecord;
    try {
      userRecord = await adminAuth.createUser({
        email,
        password,
        userName: cleanUsername,
      });
    } catch (authError) {
      // mapping firebase auth errors to friendly responses
      if (authError.code === "auth/email-already-exists") {
        return res.status(409).json({ error: "Email already in use" });
      }
      if (authError.code === "auth/invalid-email") {
        return res.status(400).json({ error: "Invalid email format" });
      }
      if (authError.code === "auth/weak-password") {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters long" });
      }
      throw authError;
    } // nested try/catch 1 ends here

    const uid = userRecord.uid; // newly created user's Firebase UID

    // 2) Publish RabbitMQ event user.created for profile-service (Full profile creation in MongoDB)
    try {
      const eventPayload = {
        uid,
        email,
        username: cleanUsername,
        displayName: displayName,
        createdAt: new Date().toISOString(),
      };

      // routing key: user.created
      await publishEvent("user.created", eventPayload);
    } catch (mqError) {
      // If publishing fails, we rollback user creation in Firebase
      console.log(
        "RabbitMQ publish failed, rolling back user creation in Firebase:",
        mqError
      );
      try {
        await adminAuth.deleteUser(uid);
      } catch (rollbackError) {
        return res.status(500).json({
          error:
            "Critical error during user creation rollback. Manual cleanup may be required.",
          details:
            process.env.NODE_ENV === "development"
              ? rollbackError.message
              : undefined,
        });
      } // rollback try/catch ends here
    } // rabbitmq try/catch ends here

    // 3) Generate custom token for Flutter client to sign-in
    const customToken = await adminAuth.createCustomToken(uid);

    // 4) Return token + uid to client (client uses signInWithCustomToken)
    return res.status(201).json({ uid, token: customToken });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  } // main try/catch ends here
};
