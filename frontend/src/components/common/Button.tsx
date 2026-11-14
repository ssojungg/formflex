import plus from '../../assets/plus.svg';

interface ButtonProps {
  text: string;
  onClick: () => void;
}

export function TextButton({ text, onClick }: ButtonProps) {
  return (
    <button
      type="button"
      className="w-[6.25rem] h-9 bg-primary-500 leading-4 rounded-[0.625rem] text-base text-white focus:outline-none hover:bg-primary-600 transition duration-300 ease-in-out"
      onClick={onClick}
    >
      {text}
    </button>
  );
}

export function AddButton({ text, onClick }: ButtonProps) {
  return (
    <button
      type="button"
      className="w-[6.25rem] h-9 bg-primary-500 rounded-[0.625rem] text-white focus:outline-none hover:bg-primary-600 transition duration-300 ease-in-out"
      onClick={onClick}
    >
      <div className="flex items-center justify-center gap-2">
        <img src={plus} alt="plus" className="w-4 h-4 my-auto" />
        <p className="text-base leading-4">{text}</p>
      </div>
    </button>
  );
}
