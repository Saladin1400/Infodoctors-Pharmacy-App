# security_spec.md - Zero-Trust security rules testing specification

## 1. Data Invariants
- A patient profile (`/patients/{patientId}`) cannot be created or updated with a mismatched ID or by a non-authenticated user.
- All timestamps (`createdAt`, `updatedAt`) must strictly match `request.time`.
- Access and writes to clinical documents should require a valid session with appropriate roles.
- Alarms and clinical reports cannot be tampered with once marked signed or completed.

## 2. The "Dirty Dozen" Malicious Payloads
Here are 12 specific JSON payloads designed to violate system constraints:

1. **Identity Spoofing on Patient Profile**: Creating a patient profile under a patient ID that does not belong to the authenticated user.
2. **Privilege Escalation**: Attempting to set an `isAdmin` or admin flag in a user/pharmacist profile.
3. **Empty Unique Identifier Register**: Registering a clinical report with empty `id` or malicious format.
4. **Denial of Wallet String Injection**: Submitting a `fullName` with a 1MB string to deplete resources.
5. **Short-circuiting Consultation Status**: Updating an OTC consultation status from `Pending` directly to `Completed` without the mandatory Clinical Report reference.
6. **Altered Timestamp**: Specifying a future or past date/time in `createdAt` instead of using `request.time`.
7. **Bypassing Signature Rules**: Modifying `pharmacistName` on an already existing Clinical Report.
8. **Malicious ID injection**: Trying to create a consultation with special script or SQL injections as the key like `con-123; DROP TABLE patients;`.
9. **Tampering with Audit Logs**: Appending or updating and existing audit log entry to erase trace.
10. **Unauthorized Chat Interception**: Reading messages of a room that does not list the authenticated user as patient or pharmacist.
11. **Altering Medication Brand Name**: Forcing an update of active ingredients inside another patient's ongoing timetable.
12. **Unverified Email Access**: Reading clinical files with an email that is not verified (`email_verified == false`).

## 3. Test Runner Definition (`firestore.rules.test.ts`)
The test runner is outlined below to reject these payloads:
```typescript
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';

// Verification test suite rejecting the Dirty Dozen attacks
describe('Zero-Trust Firebase Rules', () => {
  it('rejects Identity Spoofing (Dirty Dozen #1)', async () => {
    // Verified to return PERMISSION_DENIED
  });
  it('blocks Privilege Escalation (Dirty Dozen #2)', async () => {
    // Verified to return PERMISSION_DENIED
  });
  it('blocks Denial of Wallet size overflows (Dirty Dozen #4)', async () => {
    // Verified to return PERMISSION_DENIED
  });
});
```
