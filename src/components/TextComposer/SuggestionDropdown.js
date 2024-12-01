import { Fragment, useEffect, useRef } from "react";

const SuggestionDropdown = ({
  wordSuggestion,
  isPredict,
  suggestions,
  predictions,
  handleSuggestionSelect,
  handlePredictionSelect,
  dropdownStyles,
  dropdownItemIndexRef,
}) => {
  const dropdownLengthRef = useRef(0);
  const suggestionDropdownRef = useRef(null);
  const predictionDropdownRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.keyCode === 40 || e.keyCode === 38) {
      e.preventDefault();
      e.stopPropagation();
      const maxIndex = dropdownLengthRef.current - 1;
      const dropdownElement =
        predictionDropdownRef.current || suggestionDropdownRef.current;
      if (!dropdownElement) return;
      dropdownElement.children[dropdownItemIndexRef.current]?.classList.remove(
        "active",
      );

      if (e.keyCode === 40) {
        dropdownItemIndexRef.current =
          dropdownItemIndexRef.current === maxIndex
            ? maxIndex
            : dropdownItemIndexRef.current + 1;
        if (
          (dropdownItemIndexRef.current + 1) * 24 -
            dropdownElement.clientHeight >
          dropdownElement.scrollTop
        ) {
          dropdownElement.scrollTop += 24;
        }
      } else {
        dropdownItemIndexRef.current =
          dropdownItemIndexRef.current === 0
            ? 0
            : dropdownItemIndexRef.current - 1;
        if (dropdownItemIndexRef.current * 24 < dropdownElement.scrollTop) {
          dropdownElement.scrollTop -= 24;
        }
      }
      dropdownElement.children[dropdownItemIndexRef.current]?.classList.add(
        "active",
      );
    }
  };

  useEffect(() => {
    dropdownItemIndexRef.current = 0;
    dropdownLengthRef.current = suggestions.length || predictions.length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestions, predictions]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Fragment>
      {wordSuggestion && !!suggestions.length && (
        <div
          ref={suggestionDropdownRef}
          className="suggestion-dropdown"
          style={{
            top: `${dropdownStyles.top + 60}px`,
            left: `${dropdownStyles.left}px`,
          }}
        >
          {suggestions.map((suggestion, index) => (
            <div
              className={`dropdown-item ${index === 0 ? "active" : ""}`}
              key={`suggestion-${index}`}
              onClick={() => handleSuggestionSelect(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
      {isPredict && !!predictions.length && (
        <div
          ref={predictionDropdownRef}
          className="suggestion-dropdown"
          style={{
            top: `${dropdownStyles.top + 60}px`,
            left: `${dropdownStyles.left}px`,
          }}
        >
          {predictions.map((prediction, index) => (
            <div
              className={`dropdown-item ${index === 0 ? "active" : ""}`}
              key={`prediction-${index}`}
              onClick={() => handlePredictionSelect(prediction)}
            >
              {prediction}
            </div>
          ))}
        </div>
      )}
    </Fragment>
  );
};

export default SuggestionDropdown;
