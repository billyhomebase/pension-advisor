import { useState } from 'react';
import './AdvisorForm.css';

function AdvisorForm({ userName, customerData, onClose }) {
  const [formData, setFormData] = useState({
    name: userName || customerData?.name || '',
    email: '',
    phone: '',
    preferredTime: 'morning',
    additionalNotes: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\d\s+()-]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // For prototype: log the data and show confirmation
    console.log('Advisor request submitted:', {
      ...formData,
      customerData
    });

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="advisor-form advisor-form--submitted">
        <div className="advisor-form-success">
          <div className="success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h3>Thank you, {formData.name}!</h3>
          <p>Your request has been submitted successfully.</p>
          <p>One of our qualified advisers will contact you within 2 business days at your preferred time.</p>
          <p className="success-note">
            <strong>Reference:</strong> #{Date.now().toString(36).toUpperCase()}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="advisor-form">
      <div className="advisor-form-header">
        <h3>Speak with an Adviser</h3>
        <p>Complete the form below and one of our qualified advisers will be in touch.</p>
        {onClose && (
          <button className="advisor-form-close" onClick={onClose} aria-label="Close form">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="advisor-form-body">
        <div className="form-group">
          <label htmlFor="name">Full Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? 'input-error' : ''}
            placeholder="Enter your full name"
          />
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? 'input-error' : ''}
            placeholder="your.email@example.com"
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number *</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={errors.phone ? 'input-error' : ''}
            placeholder="07XXX XXXXXX"
          />
          {errors.phone && <span className="error-text">{errors.phone}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="preferredTime">Preferred Contact Time</label>
          <select
            id="preferredTime"
            name="preferredTime"
            value={formData.preferredTime}
            onChange={handleChange}
          >
            <option value="morning">Morning (9am - 12pm)</option>
            <option value="afternoon">Afternoon (12pm - 5pm)</option>
            <option value="evening">Evening (5pm - 7pm)</option>
            <option value="anytime">Any time</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="additionalNotes">Additional Notes (Optional)</label>
          <textarea
            id="additionalNotes"
            name="additionalNotes"
            value={formData.additionalNotes}
            onChange={handleChange}
            rows="3"
            placeholder="Any specific questions or topics you'd like to discuss?"
          />
        </div>

        <button type="submit" className="advisor-form-submit">
          Request a Call Back
        </button>

        <p className="form-disclaimer">
          By submitting this form, you consent to being contacted by M&G regarding your pension enquiry.
          Your information will be handled in accordance with our privacy policy.
        </p>
      </form>
    </div>
  );
}

export default AdvisorForm;
