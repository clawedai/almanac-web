import Link from "next/link";

export default function BookCall() {
  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#F4F4F5" }}>
      <div className="almanac-book-inner">

        {/* Back link */}
        <Link href="/almanac" className="almanac-back">
          &larr; Back to Almanac
        </Link>

        {/* Header */}
        <h1 className="almanac-book-title">Book a Call</h1>
        <p className="almanac-book-desc">Tell us about yourself and we&apos;ll reach out.</p>

        {/* Form */}
        <form
          action="https://formsubmit.co/aryaan09787@gmail.com"
          method="POST"
          className="book-form"
        >
          <input type="hidden" name="_subject" value="New Almanac Call Request" />
          <input type="hidden" name="_captcha" value="false" />
          <input type="hidden" name="_template" value="box" />

          <div className="book-field">
            <label className="book-label">Full Name</label>
            <input type="text" name="name" required placeholder="John Doe" className="book-input" />
          </div>

          <div className="book-field">
            <label className="book-label">Work Email</label>
            <input type="email" name="email" required placeholder="john@company.com" className="book-input" />
          </div>

          <div className="book-field">
            <label className="book-label">Company</label>
            <input type="text" name="company" placeholder="Acme Corp" className="book-input" />
          </div>

          <div className="book-field">
            <label className="book-label">What are you looking to achieve?</label>
            <textarea name="message" required rows={4} placeholder="Tell us about your goals..." className="book-textarea" />
          </div>

          <button type="submit" className="book-submit">
            Send Request
          </button>
        </form>

      </div>
    </main>
  );
}
