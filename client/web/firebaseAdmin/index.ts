import admin, { ServiceAccount } from "firebase-admin";
import devKey from "@/firebaseAdmin/cert/dev.json";
import prodKey from "@/firebaseAdmin/cert/prod.json";

const serviceAccount = process.env.NODE_ENV === "production" ? prodKey : devKey;

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as ServiceAccount),
    });
  } catch (error) {
    console.log("Firebase admin initialization error", error);
  }
}
export default admin.auth();
