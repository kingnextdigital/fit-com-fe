type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const sizeMap: Record<AvatarSize, { px: number; class: string; text: string }> = {
  xs: { px: 24, class: 'w-6 h-6', text: 'text-[10px]' },
  sm: { px: 32, class: 'w-8 h-8', text: 'text-xs' },
  md: { px: 40, class: 'w-10 h-10', text: 'text-sm' },
  lg: { px: 56, class: 'w-14 h-14', text: 'text-base' },
  xl: { px: 80, class: 'w-20 h-20', text: 'text-xl' },
};

const colorClasses = [
  'bg-teal-500 text-white',
  'bg-purple-500 text-white',
  'bg-blue-500 text-white',
  'bg-green-500 text-white',
  'bg-orange-500 text-white',
  'bg-pink-500 text-white',
];

function getColorClass(name: string): string {
  const index = (name.charCodeAt(0) || 0) % 6;
  return colorClasses[index];
}

function getInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return trimmed.slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

interface AvatarProps {
  src?: string;
  name: string;
  size?: AvatarSize;
  className?: string;
}

export function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  const { class: sizeClass, text: textClass } = sizeMap[size];
  const colorClass = getColorClass(name);
  const initials = getInitials(name);

  const base = `inline-flex items-center justify-center rounded-full overflow-hidden flex-shrink-0 select-none font-semibold ${sizeClass} ${className}`;

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${base} object-cover`}
      />
    );
  }

  return (
    <span className={`${base} ${colorClass} ${textClass}`}>
      {initials}
    </span>
  );
}

interface AvatarGroupUser {
  src?: string;
  name: string;
}

interface AvatarGroupProps {
  users: AvatarGroupUser[];
  max?: number;
  size?: AvatarSize;
  className?: string;
}

export function AvatarGroup({ users, max = 3, size = 'md', className = '' }: AvatarGroupProps) {
  const { class: sizeClass, text: textClass } = sizeMap[size];
  const visible = users.slice(0, max);
  const overflow = users.length - max;

  return (
    <div className={`flex items-center ${className}`}>
      {visible.map((user, i) => (
        <div
          key={i}
          className="relative"
          style={{ marginLeft: i === 0 ? 0 : '-0.5rem', zIndex: visible.length - i }}
        >
          <Avatar
            src={user.src}
            name={user.name}
            size={size}
            className="ring-2 ring-white"
          />
        </div>
      ))}
      {overflow > 0 && (
        <div
          className={`relative inline-flex items-center justify-center rounded-full bg-gray-200 text-gray-600 font-semibold ring-2 ring-white flex-shrink-0 select-none ${sizeClass} ${textClass}`}
          style={{ marginLeft: '-0.5rem', zIndex: 0 }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
