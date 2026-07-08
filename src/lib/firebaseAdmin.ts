import { initializeApp, cert, getApps, AppOptions } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || 'project-3cccff25-b1fb-4aa9-978',
};

/**
 * Resolve Admin credentials, preferring an explicit service-account JSON:
 *   - FIREBASE_SERVICE_ACCOUNT  : raw JSON (recommended for Vercel — store as a
 *                                 secret, not a file).
 *   - GOOGLE_APPLICATION_CREDENTIALS : path to a service-account key file.
 *   - otherwise : rely on Application Default Credentials (GCP environments).
 */
function resolveAdminOptions(): AppOptions {
  const saJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (saJson) {
    try {
      return { credential: cert(JSON.parse(saJson)), projectId: firebaseAdminConfig.projectId };
    } catch {
      console.error('FIREBASE_SERVICE_ACCOUNT is present but not valid JSON');
    }
  }
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return {
      credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS),
      projectId: firebaseAdminConfig.projectId,
    };
  }
  return { projectId: firebaseAdminConfig.projectId };
}

const app = getApps().length === 0
  ? initializeApp(resolveAdminOptions())
  : getApps()[0];

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);

export async function verifyIdToken(token: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return { success: true, uid: decodedToken.uid, email: decodedToken.email };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function runAdminTransaction<T>(
  callback: (transaction: FirebaseFirestore.Transaction) => Promise<T>
): Promise<T> {
  return await adminDb.runTransaction(callback);
}
