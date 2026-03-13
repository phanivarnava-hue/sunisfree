export default function Footer() {
  return (
    <footer className="border-t border-green-100 bg-green-50/50 py-8 mt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <p
          className="text-green-900 font-bold text-lg mb-1"
          style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
        >
          Sun Is Free
        </p>
        <p className="text-sm text-muted">
          Honest takes on sustainability &middot; {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
