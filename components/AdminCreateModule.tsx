
import React from 'react';
import { useAdminData } from '../contexts/AdminDataContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '../contexts/NavigationContext';
import { ModuleForm } from './common/ModuleForm';
import { SCHOOL_YEARS } from '../constants/index';

const AdminCreateModule: React.FC = () => {
    const { user } = useAuth();
    const { handleSaveModule, handleUpdateModule, isSubmitting } = useAdminData();
    const { setCurrentPage, editingModule, exitEditingModule } = useNavigation();

    const handleSave = async (data: any, isDraft: boolean) => {
        const moduleData: any = {
            ...data,
            visibility: 'public',
            classIds: [], // Admins typically create public content
            status: 'Ativo', 
        };

        if (editingModule) {
            await handleUpdateModule({ ...moduleData, id: editingModule.id, creatorId: editingModule.creatorId });
            exitEditingModule();
        } else {
            const success = await handleSaveModule({ ...moduleData, creatorId: user?.id });
            if (success) setCurrentPage('admin_modules');
        }
    };

    const handleCancel = () => {
        if (editingModule) exitEditingModule();
        else setCurrentPage('admin_modules');
    };

    return (
        <ModuleForm 
            initialData={editingModule}
            userId={user?.id}
            onSave={handleSave}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            title={editingModule ? 'Editar Módulo (Admin)' : 'Criar Módulo (Admin)'}
            subtitle="Modo Administrador: Múltiplas séries e matérias."
            defaultSeries={[SCHOOL_YEARS[0]]}
            defaultSubjects={['História']}
            availableClasses={[]} // Hide class selection for Admins
        />
    );
};

export default AdminCreateModule;
