interface ResultTypeSwitchProps<T extends string> {
  switchType: string[];
  currentState: T;
  labels: string[];
  onChange: () => void;
}

function ResultTypeSwitch<T extends string>({ switchType, currentState, labels, onChange }: ResultTypeSwitchProps<T>) {
  return (
    <div
      onClick={onChange}
      className="relative w-[11.125rem] h-[2.625rem] flex items-center bg-primary-600 rounded-[1.875rem] p-1 cursor-pointer"
    >
      <div
        className={`absolute w-[5.25rem] h-[2.125rem] rounded-[1.875rem] flex items-center justify-center bg-white shadow-md transform duration-300 ease-in-out 
                   ${currentState === switchType[1] ? 'translate-x-[5.375rem]' : 'translate-x-0'}`}
      />
      <div className="w-[89px] h-[2.125rem] flex items-center justify-center z-[2]">
        <p className={` leading-4 text-base ${currentState === switchType[0] ? 'text-black' : 'text-white'}`}>
          {labels[0]}
        </p>
      </div>
      <div className="w-[89px] h-[2.125rem] flex items-center justify-center z-[2]">
        <p className={` leading-4 text-base ${currentState === switchType[1] ? 'text-black' : 'text-white'}`}>
          {labels[1]}
        </p>
      </div>
    </div>
  );
}

export default ResultTypeSwitch;
