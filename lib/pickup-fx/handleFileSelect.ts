export function handleFileSelect(
  event: React.ChangeEvent<HTMLInputElement>,
  onChange: (value: string) => void
) {
  const file = event.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      onChange(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }
} 