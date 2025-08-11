import React from "react";

export function MultiSelect({ options, value, onChange, placeholder }) {
  // value: array of selected values
  // options: [{ value, label }]
  const [open, setOpen] = React.useState(false);
  const toggle = () => setOpen((v) => !v);
  const handleSelect = (val) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };
  const selectedLabels = options.filter((opt) => value.includes(opt.value)).map((opt) => opt.label);
  // Show first 2, then '+N more' if more selected
  let displayText = "";
  if (selectedLabels.length > 2) {
    displayText = `${selectedLabels.slice(0, 2).join(", ")} +${selectedLabels.length - 2} more`;
  } else {
    displayText = selectedLabels.join(", ");
  }
  const fullText = selectedLabels.join(", ");
  return (
    <div className="relative" style={{ maxWidth: "100%", minWidth: 0 }}>
      <button
        type="button"
        className="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 px-3 py-2 text-sm shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2"
        onClick={toggle}
        style={{ maxWidth: "100%", minWidth: 0 }}
        title={fullText}
      >
        <span
          className="truncate text-left flex-1 block"
          style={{ maxWidth: "90%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}
        >
          {selectedLabels.length > 0 ? displayText : (
            <span className="text-gray-400">{placeholder || "Select..."}</span>
          )}
        </span>
        <svg className="w-4 h-4 ml-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div
          className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg overflow-auto"
          style={{ minWidth: "100%", maxWidth: "100%", maxHeight: 240 }}
        >
          {options.length === 0 && (
            <div className="p-2 text-gray-400 text-sm">No options</div>
          )}
          {options.map((opt) => (
            <label key={opt.value} className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100" style={{ maxWidth: "100%", minWidth: 0 }}>
              <input
                type="checkbox"
                checked={value.includes(opt.value)}
                onChange={() => handleSelect(opt.value)}
                className="mr-2 accent-[#4F46E5]"
              />
              <span
                className="text-sm truncate overflow-x-hidden block"
                style={{ maxWidth: "90%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}
                title={opt.label}
              >
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
} 