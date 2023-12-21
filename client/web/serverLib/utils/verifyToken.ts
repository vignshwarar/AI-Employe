import auth from "@/firebaseAdmin";

export default async function verifyToken(token: string) {
  const bearer = token.split(" ");
  const idToken = bearer[1];
  try {
    const user = await auth.verifyIdToken(idToken);
    return user;
  } catch (error) {
    return null;
  }
}
