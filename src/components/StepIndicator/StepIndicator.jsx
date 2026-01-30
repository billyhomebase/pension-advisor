import { STAGES } from '../../constants/stages';
import './StepIndicator.css';

function StepIndicator({ currentStage }) {
  return (
    <div className="step-indicator" role="progressbar" aria-valuenow={currentStage} aria-valuemin={1} aria-valuemax={STAGES.length}>
      <div className="step-indicator-track">
        {STAGES.map((stage, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStage;
          const isCurrent = stepNumber === currentStage;
          const isUpcoming = stepNumber > currentStage;

          return (
            <div
              key={stage.id}
              className={`step-indicator-step ${isCompleted ? 'step--completed' : ''} ${isCurrent ? 'step--current' : ''} ${isUpcoming ? 'step--upcoming' : ''}`}
            >
              <div className="step-circle">
                {isCompleted ? (
                  <svg className="step-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span className="step-number">{stepNumber}</span>
                )}
              </div>
              <span className="step-label">{stage.name}</span>
              {index < STAGES.length - 1 && (
                <div className={`step-connector ${isCompleted ? 'connector--completed' : ''}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StepIndicator;
