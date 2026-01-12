
import { doc, getDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../components/firebaseClient';
import { StudentGradeSummaryDoc, Unidade } from '../types';

/**
 * Updates the consolidated student grade report (Big Doc) in Firestore.
 * This is crucial for the "Boletim" and "School Records" features.
 * 
 * OPTIMIZED: Uses Firestore Transaction to prevent race conditions when multiple
 * teachers grade different subjects simultaneously.
 */
export const recalculateStudentGradeSummary = async (
    classId: string, 
    studentId: string, 
    updatedActivityInfo: { activityId: string, title: string, grade: number, maxPoints: number, unidade: Unidade, materia: string },
    fallbackClassName?: string
) => {
    const summaryId = `${classId}_${studentId}`;
    const summaryRef = doc(db, "student_grades", summaryId);

    try {
        await runTransaction(db, async (transaction) => {
            const summarySnap = await transaction.get(summaryRef);
            
            let summaryData: StudentGradeSummaryDoc;
            let className = fallbackClassName || 'Turma';

            if (summarySnap.exists()) {
                summaryData = summarySnap.data() as StudentGradeSummaryDoc;
                // Update class name if missing or generic
                if (className !== 'Turma' && (!summaryData.className || summaryData.className === 'Turma')) {
                    summaryData.className = className;
                }
            } else {
                // Try to fetch class name if creating new doc and name is generic
                if (className === 'Turma') {
                    // Note: We can't use getDoc inside a transaction for a doc we aren't writing to safely without reading it first.
                    // For performance in transaction, we skip the class read if it's missing and rely on fallback.
                    // Future improvement: Pass class name reliably.
                }

                summaryData = {
                    classId,
                    studentId,
                    className,
                    unidades: {},
                    updatedAt: serverTimestamp()
                };
            }

            // Update specific activity in the structure
            const { unidade, materia, activityId, title, grade, maxPoints } = updatedActivityInfo;
            const unidadeKey = unidade || '1ª Unidade';
            const materiaKey = materia || 'Geral';

            if (!summaryData.unidades[unidadeKey]) {
                summaryData.unidades[unidadeKey] = { subjects: {} };
            }
            if (!summaryData.unidades[unidadeKey]!.subjects[materiaKey]) {
                summaryData.unidades[unidadeKey]!.subjects[materiaKey] = { activities: {}, totalPoints: 0 };
            }

            const subjectEntry = summaryData.unidades[unidadeKey]!.subjects[materiaKey];
            
            // Map-based update (O(1) Access)
            // Check if activity already exists to adjust total points correctly
            const previousGrade = subjectEntry.activities[activityId]?.grade || 0;
            
            // Update or Set Activity
            subjectEntry.activities[activityId] = {
                id: activityId,
                title: title,
                grade: grade,
                maxPoints: maxPoints,
                materia: materiaKey
            };

            // Recalculate total points for the subject
            // We use a robust recalculation from the map to ensure accuracy
            subjectEntry.totalPoints = Object.values(subjectEntry.activities).reduce((acc, curr) => acc + curr.grade, 0);

            summaryData.updatedAt = serverTimestamp();

            // Write back
            transaction.set(summaryRef, summaryData, { merge: true });
        });

    } catch (error) {
        console.error("Failed to update student grade summary (Transaction):", error);
        throw error;
    }
};