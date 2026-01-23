import React from 'react';

interface PasswordStrengthIndicatorProps {
    password: string;
}

interface PasswordRequirement {
    label: string;
    met: boolean;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
    const requirements: PasswordRequirement[] = [
        {
            label: 'At least 8 characters',
            met: password.length >= 8,
        },
        {
            label: 'Contains uppercase letter',
            met: /[A-Z]/.test(password),
        },
        {
            label: 'Contains lowercase letter',
            met: /[a-z]/.test(password),
        },
        {
            label: 'Contains number',
            met: /\d/.test(password),
        },
        {
            label: 'Contains special character',
            met: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        },
    ];

    const metCount = requirements.filter((req) => req.met).length;
    const strength = metCount === 0 ? 0 : (metCount / requirements.length) * 100;

    const getStrengthColor = () => {
        if (strength < 40) return 'bg-red-500';
        if (strength < 60) return 'bg-yellow-500';
        if (strength < 80) return 'bg-blue-500';
        return 'bg-green-500';
    };

    const getStrengthLabel = () => {
        if (strength < 40) return 'Weak';
        if (strength < 60) return 'Fair';
        if (strength < 80) return 'Good';
        return 'Strong';
    };

    if (!password) return null;

    return (
        <div className="mt-2 space-y-2">
            <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                        style={{ width: `${strength}%` }}
                    />
                </div>
                <span className="text-xs font-medium text-gray-600">{getStrengthLabel()}</span>
            </div>

            <ul className="space-y-1">
                {requirements.map((req, index) => (
                    <li key={index} className="flex items-center gap-2 text-xs">
                        {req.met ? (
                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        )}
                        <span className={req.met ? 'text-green-600' : 'text-gray-500'}>{req.label}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PasswordStrengthIndicator;
