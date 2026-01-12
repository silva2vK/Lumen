
import React from 'react';

export const InputField: React.FC<{ label: string, required?: boolean, children: React.ReactNode, helperText?: string }> = ({ label, required, children, helperText }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1 hc-text-secondary">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
        {helperText && <p className="mt-1 text-xs text-gray-500 dark:text-slate-400 hc-text-secondary">{helperText}</p>}
    </div>
);

export const SelectField: React.FC<{ value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, children: React.ReactNode }> = ({ value, onChange, children }) => (
    <select value={value} onChange={onChange} className="w-full p-2 input-tech">
        {children}
    </select>
);

export const MultiSelect: React.FC<{
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    label: string;
    error?: boolean;
    helperText?: string;
    id?: string;
}> = ({ options, selected, onChange, label, error, helperText, id }) => {
    const toggleOption = (option: string) => {
        if (selected.includes(option)) {
            onChange(selected.filter(item => item !== option));
        } else {
            onChange([...selected, option]);
        }
    };

    const errorId = id ? `${id}-error` : undefined;
    const descriptionId = id ? `${id}-description` : undefined;
    const labelId = id ? `${id}-label` : undefined;

    return (
        <div className="space-y-2" role="group" aria-labelledby={labelId}>
            <label id={labelId} className={`block text-sm font-medium ${error ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-slate-300'}`}>
                {label} <span className="text-red-500">*</span>
            </label>
            <div 
                className={`p-3 border rounded-md bg-white dark:bg-slate-700 max-h-48 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 ${error ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-slate-600'}`}
                aria-describedby={error ? errorId : helperText ? descriptionId : undefined}
            >
                {options.map(option => (
                    <label key={option} className="flex items-center space-x-2 cursor-pointer p-1 hover:bg-slate-50 dark:hover:bg-slate-600 rounded">
                        <input
                            type="checkbox"
                            checked={selected.includes(option)}
                            onChange={() => toggleOption(option)}
                            className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 dark:bg-slate-600 dark:border-slate-500"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-200">{option}</span>
                    </label>
                ))}
            </div>
            {(error || helperText) && (
                <p 
                    id={error ? errorId : descriptionId}
                    role={error ? "alert" : undefined}
                    className={`text-xs ${error ? 'text-red-500 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}
                >
                    {error ? (helperText || 'Selecione pelo menos uma opção.') : helperText}
                </p>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400">
                {selected.length === 0 ? 'Nenhum selecionado' : `${selected.length} selecionado(s)`}
            </p>
        </div>
    );
};
