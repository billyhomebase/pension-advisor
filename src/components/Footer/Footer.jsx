import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <p className="footer-text">
          &copy; {currentYear} M&G plc. For UK residents only.
        </p>
        <p className="footer-disclaimer">
          This is a prototype for demonstration purposes.
          Always seek professional financial advice.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
