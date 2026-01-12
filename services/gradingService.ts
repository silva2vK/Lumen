
import { supabase } from '../components/supabaseClient';

export interface StreamingGradingResult {
    finalGrade: number;
    fullFeedback: string;
}

export async function streamGradingFeedback(
    question: string,
    answer: string,
    maxPoints: number,
    onChunk: (text: string) => void
): Promise<StreamingGradingResult> {
    
    if (!answer || answer.trim() === "") {
        return { finalGrade: 0, fullFeedback: "Não houve resposta para esta questão." };
    }

    const prompt = `
    Atue como um Tutor de História Sênior utilizando a **Lente Semântica**.
    
    Analise a resposta do aluno para a questão abaixo com foco em:
    1. Precisão Conceitual.
    2. Estrutura Lógica.
    3. Contextualização.

    ---
    Enunciado: "${question}"
    Resposta do Aluno: "${answer}"
    Valor da Questão: ${maxPoints} pontos
    ---

    Instruções de Saída:
    1. Forneça um **Feedback Pedagógico**.
    2. Ao final, atribua a nota no formato: [[GRADE: <numero>]]
    `;

    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Usuário não autenticado.");
        const token = session.access_token;

        const response = await fetch('/api/ai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                model: 'gemini-3-pro-preview',
                contents: [{ parts: [{ text: prompt }] }],
                config: {
                    temperature: 0.2,
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Erro na IA: ${response.statusText}`);
        }

        const data = await response.json();
        const fullText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        
        if (fullText) {
            onChunk(fullText);
        }

        let finalGrade = 0;
        const gradeMatch = fullText.match(/\[\[GRADE:\s*([\d\.,]+)\s*\]\]/);
        if (gradeMatch) {
            const gradeString = gradeMatch[1].replace(',', '.');
            finalGrade = parseFloat(gradeString);
        }

        finalGrade = Math.max(0, Math.min(finalGrade, maxPoints));

        return {
            finalGrade,
            fullFeedback: fullText
        };

    } catch (error) {
        console.error("Error in AI Grading Service:", error);
        throw error;
    }
}
