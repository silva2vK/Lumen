
import { useState, useCallback, useEffect } from 'react';
import { doc, getDoc, updateDoc, arrayUnion, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../components/firebaseClient';
import type { User, MunicipalSecretariatData } from '../types';

export function useStateSecretariatData(user: User | null, addToast: (msg: string, type: any) => void) {
    const [municipalities, setMunicipalities] = useState<MunicipalSecretariatData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingMunicipality, setIsAddingMunicipality] = useState(false);
    
    // Derived stats
    const [globalStats, setGlobalStats] = useState({
        totalMunicipalities: 0,
        totalSchools: 0
    });

    // Mock generator for advanced network stats
    const generateNetworkStats = () => ({
        networkPerformance: 5 + Math.random() * 4, // 5.0 to 9.0
        dropoutRiskRate: Math.random() * 15 // 0 to 15%
    });

    const fetchMunicipalities = useCallback(async () => {
        if (!user || user.role !== 'secretaria_estadual') return;
        setIsLoading(true);

        try {
            const userRef = doc(db, "users", user.id);
            const userSnap = await getDoc(userRef);
            
            if (!userSnap.exists()) {
                setMunicipalities([]);
                setIsLoading(false);
                return;
            }

            const userData = userSnap.data();
            const linkedIds: string[] = userData.linkedMunicipalities || [];

            if (linkedIds.length === 0) {
                setMunicipalities([]);
                setGlobalStats({ totalMunicipalities: 0, totalSchools: 0 });
                setIsLoading(false);
                return;
            }

            const municipalPromises = linkedIds.map(async (municipalityId) => {
                const muniRef = doc(db, "users", municipalityId);
                const muniSnap = await getDoc(muniRef);
                
                if (!muniSnap.exists()) return null;
                
                const muniData = muniSnap.data();
                const schoolCount = (muniData.linkedSchoolIds || []).length;
                
                const stats = generateNetworkStats();

                return {
                    id: municipalityId,
                    name: muniData.name || 'Secretaria Municipal',
                    email: muniData.email || '',
                    totalSchools: schoolCount,
                    ...stats
                } as MunicipalSecretariatData;
            });

            const loadedMunicipalities = (await Promise.all(municipalPromises)).filter((m): m is MunicipalSecretariatData => m !== null);
            setMunicipalities(loadedMunicipalities);

            // Calculate Global Stats
            const stats = loadedMunicipalities.reduce((acc, curr) => ({
                totalMunicipalities: acc.totalMunicipalities + 1,
                totalSchools: acc.totalSchools + curr.totalSchools
            }), { totalMunicipalities: 0, totalSchools: 0 });
            
            setGlobalStats(stats);

        } catch (error) {
            console.error("Error fetching state secretariat data:", error);
            addToast("Erro ao carregar dados.", "error");
        } finally {
            setIsLoading(false);
        }
    }, [user, addToast]);

    useEffect(() => {
        fetchMunicipalities();
    }, [fetchMunicipalities]);

    const handleAddMunicipality = async (secretariatId: string) => {
        if (!user) return;
        if (!secretariatId.trim()) {
            addToast("ID inválido.", "error");
            return;
        }

        setIsAddingMunicipality(true);
        try {
            const targetRef = doc(db, "users", secretariatId);
            const targetSnap = await getDoc(targetRef);
            
            if (!targetSnap.exists()) {
                addToast("ID não encontrado no sistema.", "error");
                setIsAddingMunicipality(false);
                return;
            }
            
            const targetData = targetSnap.data();
            if (targetData.role !== 'secretaria') {
                addToast("Este ID não pertence a uma Secretaria Municipal.", "error");
                setIsAddingMunicipality(false);
                return;
            }

            if (municipalities.some(m => m.id === secretariatId)) {
                addToast("Esta secretaria já está na lista.", "info");
                setIsAddingMunicipality(false);
                return;
            }

            const userRef = doc(db, "users", user.id);
            await updateDoc(userRef, {
                linkedMunicipalities: arrayUnion(secretariatId)
            });

            addToast("Secretaria Municipal adicionada!", "success");
            fetchMunicipalities(); 

        } catch (error) {
            console.error("Error adding municipality:", error);
            addToast("Erro ao adicionar secretaria.", "error");
        } finally {
            setIsAddingMunicipality(false);
        }
    };

    return {
        municipalities,
        globalStats,
        isLoading,
        isAddingMunicipality,
        handleAddMunicipality,
        fetchMunicipalities
    };
}
