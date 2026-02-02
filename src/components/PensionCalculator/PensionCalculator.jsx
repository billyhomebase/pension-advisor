import { useState, useCallback, useMemo } from 'react';
import './PensionCalculator.css';

// M&G Pension Calculator Assumptions
const ASSUMPTIONS = {
  growthRates: {
    low: 0.02,
    medium: 0.05,
    high: 0.08
  },
  annualManagementCharge: 0.0075,
  inflation: 0.02,
  taxFreePercentage: 0.25
};

// Calculate future pension pot value
function calculateFuturePot(currentPot, monthlyContribution, yearsToRetirement, growthRate) {
  const netGrowthRate = growthRate - ASSUMPTIONS.annualManagementCharge;
  const monthlyRate = netGrowthRate / 12;
  const months = yearsToRetirement * 12;

  // Future value of current pot with compound growth
  const futureCurrentPot = currentPot * Math.pow(1 + netGrowthRate, yearsToRetirement);

  // Future value of monthly contributions (future value of annuity)
  let futureContributions = 0;
  if (monthlyRate > 0 && monthlyContribution > 0) {
    futureContributions = monthlyContribution *
      ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  } else if (monthlyContribution > 0) {
    futureContributions = monthlyContribution * months;
  }

  return futureCurrentPot + futureContributions;
}

// Calculate values adjusted for inflation
function adjustForInflation(amount, years) {
  return amount / Math.pow(1 + ASSUMPTIONS.inflation, years);
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

function PensionCalculator({ onComplete, initialValues = {} }) {
  const [values, setValues] = useState({
    currentAge: initialValues.currentAge || 35,
    retirementAge: initialValues.retirementAge || 65,
    currentPot: initialValues.currentPot || 25000,
    monthlyContribution: initialValues.monthlyContribution || 200,
    riskLevel: initialValues.riskLevel || 'medium'
  });

  const [showResults, setShowResults] = useState(false);

  const yearsToRetirement = Math.max(0, values.retirementAge - values.currentAge);

  // Calculate projections for all risk levels
  const projections = useMemo(() => {
    const results = {};

    Object.entries(ASSUMPTIONS.growthRates).forEach(([level, rate]) => {
      const futurePot = calculateFuturePot(
        values.currentPot,
        values.monthlyContribution,
        yearsToRetirement,
        rate
      );

      const taxFreeCash = futurePot * ASSUMPTIONS.taxFreePercentage;
      const remainingPot = futurePot - taxFreeCash;
      const todaysValue = adjustForInflation(futurePot, yearsToRetirement);

      results[level] = {
        futurePot,
        taxFreeCash,
        remainingPot,
        todaysValue
      };
    });

    return results;
  }, [values.currentPot, values.monthlyContribution, yearsToRetirement]);

  const selectedProjection = projections[values.riskLevel];

  const handleChange = useCallback((field, value) => {
    setValues(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleCalculate = useCallback(() => {
    setShowResults(true);
  }, []);

  const handleUseInChat = useCallback(() => {
    if (onComplete) {
      onComplete({
        inputs: values,
        projection: selectedProjection,
        yearsToRetirement
      });
    }
  }, [onComplete, values, selectedProjection, yearsToRetirement]);

  return (
    <div className="pension-calculator">
      <div className="calculator-header">
        <svg className="calculator-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <line x1="8" y1="6" x2="16" y2="6" />
          <line x1="8" y1="10" x2="10" y2="10" />
          <line x1="14" y1="10" x2="16" y2="10" />
          <line x1="8" y1="14" x2="10" y2="14" />
          <line x1="14" y1="14" x2="16" y2="14" />
          <line x1="8" y1="18" x2="16" y2="18" />
        </svg>
        <h3>Pension Pot Calculator</h3>
      </div>

      <div className="calculator-body">
        <div className="calculator-inputs">
          {/* Current Age */}
          <div className="input-group">
            <label htmlFor="currentAge">
              Your current age
              <span className="input-value">{values.currentAge} years</span>
            </label>
            <input
              type="range"
              id="currentAge"
              min="18"
              max="70"
              value={values.currentAge}
              onChange={(e) => handleChange('currentAge', parseInt(e.target.value))}
            />
            <div className="range-labels">
              <span>18</span>
              <span>70</span>
            </div>
          </div>

          {/* Retirement Age */}
          <div className="input-group">
            <label htmlFor="retirementAge">
              When do you want to retire?
              <span className="input-value">{values.retirementAge} years</span>
            </label>
            <input
              type="range"
              id="retirementAge"
              min="55"
              max="75"
              value={values.retirementAge}
              onChange={(e) => handleChange('retirementAge', parseInt(e.target.value))}
            />
            <div className="range-labels">
              <span>55</span>
              <span>75</span>
            </div>
          </div>

          {/* Current Pot Value */}
          <div className="input-group">
            <label htmlFor="currentPot">
              Current pension pot value
              <span className="input-value">{formatCurrency(values.currentPot)}</span>
            </label>
            <input
              type="range"
              id="currentPot"
              min="0"
              max="500000"
              step="1000"
              value={values.currentPot}
              onChange={(e) => handleChange('currentPot', parseInt(e.target.value))}
            />
            <div className="range-labels">
              <span>£0</span>
              <span>£500k</span>
            </div>
          </div>

          {/* Monthly Contribution */}
          <div className="input-group">
            <label htmlFor="monthlyContribution">
              Monthly contribution
              <span className="input-value">{formatCurrency(values.monthlyContribution)}</span>
            </label>
            <input
              type="range"
              id="monthlyContribution"
              min="0"
              max="2000"
              step="25"
              value={values.monthlyContribution}
              onChange={(e) => handleChange('monthlyContribution', parseInt(e.target.value))}
            />
            <div className="range-labels">
              <span>£0</span>
              <span>£2,000</span>
            </div>
          </div>

          {/* Risk Level */}
          <div className="input-group">
            <label>Investment risk level</label>
            <div className="risk-buttons">
              {['low', 'medium', 'high'].map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`risk-btn ${values.riskLevel === level ? 'risk-btn--active' : ''}`}
                  onClick={() => handleChange('riskLevel', level)}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                  <span className="risk-rate">
                    {(ASSUMPTIONS.growthRates[level] * 100).toFixed(0)}% growth
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Years to retirement info */}
        <div className="years-info">
          <span className="years-label">Years until retirement:</span>
          <span className="years-value">{yearsToRetirement} years</span>
        </div>

        {!showResults ? (
          <button
            className="calculate-btn"
            onClick={handleCalculate}
            disabled={yearsToRetirement <= 0}
          >
            Calculate my pension
          </button>
        ) : (
          <div className="calculator-results">
            <h4>Your projected pension pot at age {values.retirementAge}</h4>

            <div className="result-cards">
              <div className="result-card result-card--primary">
                <span className="result-label">Estimated pot value</span>
                <span className="result-value">{formatCurrency(selectedProjection.futurePot)}</span>
                <span className="result-note">Based on {values.riskLevel} growth ({(ASSUMPTIONS.growthRates[values.riskLevel] * 100).toFixed(0)}%)</span>
              </div>

              <div className="result-card result-card--muted">
                <span className="result-label">Tax-free cash (25%)</span>
                <span className="result-value">{formatCurrency(selectedProjection.taxFreeCash)}</span>
              </div>

              <div className="result-card result-card--muted">
                <span className="result-label">Remaining for income</span>
                <span className="result-value">{formatCurrency(selectedProjection.remainingPot)}</span>
              </div>

              <div className="result-card result-card--muted">
                <span className="result-label">In today's money</span>
                <span className="result-value">{formatCurrency(selectedProjection.todaysValue)}</span>
                <span className="result-note">Adjusted for {(ASSUMPTIONS.inflation * 100).toFixed(0)}% inflation</span>
              </div>
            </div>

            <div className="projection-comparison">
              <h5>Compare growth scenarios</h5>
              <div className="comparison-bars">
                {Object.entries(projections).map(([level, data]) => (
                  <div key={level} className={`comparison-bar ${values.riskLevel === level ? 'comparison-bar--active' : ''}`}>
                    <span className="bar-label">{level.charAt(0).toUpperCase() + level.slice(1)}</span>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{
                          width: `${Math.min(100, (data.futurePot / projections.high.futurePot) * 100)}%`
                        }}
                      />
                    </div>
                    <span className="bar-value">{formatCurrency(data.futurePot)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="calculator-disclaimer">
              <p>
                <strong>Important:</strong> This is an estimate only. Actual returns may vary.
                Assumes {(ASSUMPTIONS.annualManagementCharge * 100).toFixed(2)}% annual management charge.
                Tax rules can change and their effects depend on your circumstances.
              </p>
            </div>

            {onComplete && (
              <button className="use-results-btn" onClick={handleUseInChat}>
                Use these results in our conversation
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PensionCalculator;
