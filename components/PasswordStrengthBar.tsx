import { Check, X } from "lucide-react";

interface PasswordRequirement {
  text: string;
  regex: RegExp;
}

const requirements: PasswordRequirement[] = [
  { text: "At least 8 characters", regex: /.{8,}/ },
  { text: "Contains uppercase letter", regex: /[A-Z]/ },
  { text: "Contains lowercase letter", regex: /[a-z]/ },
  { text: "Contains number", regex: /[0-9]/ },
  { text: "Contains special character", regex: /[^A-Za-z0-9]/ },
];

interface PasswordStrengthBarProps {
  password: string;
}

export function PasswordStrengthBar({ password }: PasswordStrengthBarProps) {
  const getStrengthPercentage = () => {
    if (!password) return 0;
    return (requirements.filter(req => req.regex.test(password)).length / requirements.length) * 100;
  };

  const getStrengthColor = () => {
    const strength = getStrengthPercentage();
    if (strength <= 20) return "bg-red-500";
    if (strength <= 40) return "bg-orange-500";
    if (strength <= 60) return "bg-yellow-500";
    if (strength <= 80) return "bg-blue-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-3">
      {/* Strength bar */}
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${getStrengthColor()}`}
          style={{ width: `${getStrengthPercentage()}%` }}
        />
      </div>

      {/* Requirements list */}
      <div className="space-y-2">
        {requirements.map((requirement, index) => (
          <div
            key={index}
            className="flex items-center text-sm gap-2"
          >
            {requirement.regex.test(password) ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-red-500" />
            )}
            <span className={requirement.regex.test(password) ? "text-green-700" : "text-gray-600"}>
              {requirement.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
} 