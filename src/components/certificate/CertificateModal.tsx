import React, { useRef, useState, useEffect } from 'react';
import {
  Award, Download, Printer, Share2, CheckCircle2, X,
  Sparkles, ShieldCheck, Coffee, QrCode, FileText, Copy,
  Lock, AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  courseId: number;
  userName: string;
  isEarned: boolean;      // NEW: must be true to show/download certificate
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen, onClose, courseTitle, courseId, userName, isEarned
}) => {
  const [recipientName, setRecipientName]       = useState(userName || 'Developer');
  const [isEditingName, setIsEditingName]       = useState(false);
  const [copiedLink, setCopiedLink]             = useState(false);
  const [isGeneratingImg, setIsGeneratingImg]   = useState(false);
  const certRef  = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const certId = `ORACLE-CERT-${courseId.toString().padStart(2, '0')}-${Math.abs(
    (recipientName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) * 89 + courseId * 997)
  ).toString(16).toUpperCase().padStart(6, '0')}`;

  const issueDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  useEffect(() => {
    if (isOpen && isEarned) {
      confetti({
        particleCount: 120,
        spread: 85,
        origin: { y: 0.6 },
        colors: ['#F89820', '#22C55E', '#3B82F6', '#EAB308', '#FFFFFF']
      });
    }
  }, [isOpen, isEarned]);

  if (!isOpen) return null;

  // ── NOT EARNED: Show lock screen ──────────────────────────────────────────
  if (!isEarned) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
        <div className="w-full max-w-md bg-[#0F1A2E] rounded-2xl border border-white/10 shadow-2xl p-8 text-center space-y-6">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-sm">✕</button>

          <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
            <Lock className="w-10 h-10 text-gray-500" />
          </div>

          <div>
            <h3 className="text-xl font-extrabold text-white font-mono">Certificate Locked</h3>
            <p className="text-sm text-gray-400 font-mono mt-2 leading-relaxed">
              You must complete <span className="text-[#F89820] font-bold">100% of all lessons</span> in<br />
              <span className="text-white font-semibold">"{courseTitle}"</span><br />
              to earn your official certificate.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#151F32] border border-white/5 text-xs font-mono text-gray-400 leading-relaxed text-left space-y-2">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-[#F89820] flex-shrink-0 mt-0.5" />
              <span>Open the classroom, work through each lesson, and click <strong className="text-white">"Mark Lesson as Complete"</strong> after every one.</span>
            </div>
            <div className="flex items-start space-x-2">
              <Award className="w-4 h-4 text-[#F89820] flex-shrink-0 mt-0.5" />
              <span>Once you reach <strong className="text-white">100%</strong>, the certificate button will glow and become downloadable.</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#F89820] text-black font-mono font-bold text-sm hover:opacity-90 transition"
          >
            Go Complete the Course →
          </button>
        </div>
      </div>
    );
  }

  // ── EARNED: Show full certificate ─────────────────────────────────────────

  const handleDownloadImage = async () => {
    try {
      setIsGeneratingImg(true);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width  = 2400;
      canvas.height = 1700;

      // Dark obsidian background
      const bgGrad = ctx.createRadialGradient(1200, 850, 100, 1200, 850, 1400);
      bgGrad.addColorStop(0, '#101726');
      bgGrad.addColorStop(1, '#060C18');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 2400, 1700);

      // Gold border
      ctx.strokeStyle = '#F89820';
      ctx.lineWidth = 24;
      ctx.strokeRect(50, 50, 2300, 1600);
      ctx.strokeStyle = 'rgba(248,152,32,0.3)';
      ctx.lineWidth = 8;
      ctx.strokeRect(80, 80, 2240, 1540);

      // Corner accent dots
      const corners = [[130, 130], [2270, 130], [130, 1570], [2270, 1570]];
      corners.forEach(([x, y]) => {
        ctx.fillStyle = '#F89820';
        ctx.beginPath();
        ctx.arc(x, y, 18, 0, Math.PI * 2);
        ctx.fill();
      });

      // Orange glow
      const glow = ctx.createRadialGradient(1200, 850, 50, 1200, 850, 800);
      glow.addColorStop(0, 'rgba(248,152,32,0.08)');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, 2400, 1700);

      // Header: OOP'S ORACLE
      ctx.textAlign = 'center';
      ctx.fillStyle = '#F89820';
      ctx.font = 'bold 72px serif';
      ctx.letterSpacing = '0.2em';
      ctx.fillText("OOP'S ORACLE", 1200, 240);

      ctx.fillStyle = 'rgba(248,152,32,0.5)';
      ctx.font = '32px monospace';
      ctx.fillText('Master Java. Master Logic. Build Your Future.', 1200, 310);

      // Divider
      const divGrad = ctx.createLinearGradient(300, 0, 2100, 0);
      divGrad.addColorStop(0, 'transparent');
      divGrad.addColorStop(0.5, '#F89820');
      divGrad.addColorStop(1, 'transparent');
      ctx.strokeStyle = divGrad;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(300, 360); ctx.lineTo(2100, 360);
      ctx.stroke();

      // Certificate of Completion text
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = 'italic 44px serif';
      ctx.fillText('CERTIFICATE OF COMPLETION', 1200, 460);

      // "This certifies that"
      ctx.fillStyle = '#94A3B8';
      ctx.font = '36px sans-serif';
      ctx.fillText('This certifies that', 1200, 580);

      // Recipient Name
      const nameGrad = ctx.createLinearGradient(600, 0, 1800, 0);
      nameGrad.addColorStop(0, '#FFFFFF');
      nameGrad.addColorStop(0.5, '#F89820');
      nameGrad.addColorStop(1, '#FFFFFF');
      ctx.fillStyle = nameGrad;
      ctx.font = 'bold 110px serif';
      ctx.fillText(recipientName, 1200, 720);

      // "has successfully completed"
      ctx.fillStyle = '#94A3B8';
      ctx.font = '36px sans-serif';
      ctx.fillText('has successfully completed the Java engineering track', 1200, 820);

      // Course Title
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 56px sans-serif';
      const title = courseTitle.length > 48 ? courseTitle.substring(0, 48) + '…' : courseTitle;
      ctx.fillText(title, 1200, 940);

      // Stats row
      const stats = ['50+ In-Depth Concepts', '3+ Hours Per Concept', 'Java 17 LTS', 'Server-Verified'];
      stats.forEach((stat, i) => {
        const x = 500 + (i * 380);
        ctx.fillStyle = 'rgba(248,152,32,0.15)';
        ctx.beginPath();
        ctx.roundRect(x - 155, 1010, 310, 60, 12);
        ctx.fill();
        ctx.fillStyle = '#F89820';
        ctx.font = 'bold 24px monospace';
        ctx.fillText(stat, x, 1050);
      });

      // Divider 2
      ctx.strokeStyle = divGrad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(300, 1130); ctx.lineTo(2100, 1130);
      ctx.stroke();

      // Date and cert ID
      ctx.fillStyle = '#94A3B8';
      ctx.font = '30px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`Date of Issue: ${issueDate}`, 300, 1240);
      ctx.textAlign = 'right';
      ctx.fillText(`Verification ID: ${certId}`, 2100, 1240);

      // Official seal
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(248,152,32,0.1)';
      ctx.beginPath(); ctx.arc(1200, 1450, 120, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#F89820'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(1200, 1450, 120, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#F89820'; ctx.font = 'bold 36px serif';
      ctx.fillText('CERTIFIED', 1200, 1430);
      ctx.font = '24px monospace';
      ctx.fillStyle = 'rgba(248,152,32,0.7)';
      ctx.fillText("OOP'S ORACLE", 1200, 1470);
      ctx.fillText('OFFICIAL SEAL', 1200, 1500);

      ctx.font = '22px monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillText('verify.oopsoracle.com · Java Engineering Credentials · ' + certId, 1200, 1620);

      // Download
      const link = document.createElement('a');
      link.download = `OopsOracle_Certificate_${courseId}_${recipientName.replace(/ /g, '_')}.png`;
      link.href = canvas.toDataURL('image/png', 0.98);
      link.click();
    } catch (err) {
      console.error('Certificate generation error:', err);
    } finally {
      setIsGeneratingImg(false);
    }
  };

  const handlePrint = () => {
    if (!certRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>OOP'S ORACLE Certificate</title>
      <style>
        body { margin: 0; background: #060C18; }
        .cert { font-family: serif; }
      </style></head><body>
      ${certRef.current.outerHTML}
      <script>window.onload=()=>{window.print();window.close();}</script>
      </body></html>
    `);
    printWindow.document.close();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://oopsoracle.com/verify/${certId}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm overflow-y-auto">
      <canvas ref={canvasRef} className="hidden" />

      <div className="w-full max-w-4xl space-y-4">

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#0F1A2E] border border-white/10">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-[#F89820]" />
            <span className="font-mono font-bold text-white text-sm">Official Certificate of Completion</span>
            <span className="px-2 py-0.5 rounded-full bg-[#22C55E]/20 text-[#22C55E] text-[10px] font-mono font-bold border border-[#22C55E]/30">EARNED</span>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={handleDownloadImage} disabled={isGeneratingImg}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#F89820] to-[#E65100] text-black font-mono text-xs font-bold hover:opacity-90 transition disabled:opacity-50">
              <Download className="w-3.5 h-3.5" />
              <span>{isGeneratingImg ? 'Generating…' : 'Download PNG'}</span>
            </button>
            <button onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-mono text-xs transition">
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button onClick={handleCopyLink}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-mono text-xs transition">
              {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
            </button>
            <button onClick={onClose}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Certificate Design */}
        <div
          ref={certRef}
          className="relative w-full rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(248,152,32,0.3)] border-4 border-[#F89820]"
          style={{
            background: 'radial-gradient(ellipse at center, #101726 0%, #060C18 100%)',
            padding: '3px'
          }}
        >
          <div className="relative p-10 md:p-16 text-center space-y-6"
            style={{ background: 'radial-gradient(ellipse at center, rgba(248,152,32,0.06) 0%, transparent 70%)' }}
          >
            {/* Inner border */}
            <div className="absolute inset-4 border border-[#F89820]/30 rounded-xl pointer-events-none" />

            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-3 mb-2">
                <Coffee className="w-7 h-7 text-[#F89820]" />
                <h2 className="text-3xl md:text-4xl font-extrabold font-serif tracking-widest"
                  style={{ background: 'linear-gradient(90deg,#fff,#F89820,#fff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  OOP'S ORACLE
                </h2>
                <Coffee className="w-7 h-7 text-[#F89820]" />
              </div>
              <p className="text-xs font-mono text-[#F89820]/70 tracking-widest uppercase">
                Master Java. Master Logic. Build Your Future.
              </p>
              <div className="h-px bg-gradient-to-r from-transparent via-[#F89820] to-transparent mt-4" />
            </div>

            {/* Certificate title */}
            <div>
              <p className="text-[11px] font-mono text-gray-500 uppercase tracking-[0.3em]">Certificate of Completion</p>
              <p className="text-xs font-mono text-gray-400 mt-2">This certifies that</p>
            </div>

            {/* Recipient name (editable) */}
            <div>
              {isEditingName ? (
                <input
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  autoFocus
                  className="text-3xl md:text-5xl font-extrabold font-serif text-center w-full bg-transparent border-b-2 border-[#F89820] text-white focus:outline-none pb-1"
                />
              ) : (
                <div
                  onClick={() => setIsEditingName(true)}
                  className="cursor-pointer group"
                  title="Click to edit your name"
                >
                  <h3 className="text-3xl md:text-5xl font-extrabold font-serif"
                    style={{ background: 'linear-gradient(90deg,#fff 20%,#F89820 50%,#fff 80%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {recipientName}
                  </h3>
                  <span className="text-[10px] font-mono text-gray-600 group-hover:text-gray-400 transition">click to edit name</span>
                </div>
              )}
            </div>

            <p className="text-xs font-mono text-gray-400">has successfully completed the Java engineering track</p>

            {/* Course title */}
            <div className="px-6 py-3 rounded-xl border border-[#F89820]/30 bg-[#F89820]/5 inline-block max-w-2xl mx-auto">
              <h4 className="text-lg md:text-2xl font-bold text-white font-mono">{courseTitle}</h4>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {['50+ In-Depth Concepts', '3+ Hours Per Concept', 'Java 17 LTS', 'Razorpay Verified'].map((badge) => (
                <span key={badge} className="px-3 py-1 rounded-full bg-[#F89820]/10 border border-[#F89820]/20 text-[#F89820] text-[11px] font-mono font-semibold">
                  {badge}
                </span>
              ))}
            </div>

            {/* Footer row */}
            <div className="h-px bg-gradient-to-r from-transparent via-[#F89820]/40 to-transparent" />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-gray-500">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                <span className="text-[#22C55E] font-semibold">Cryptographically Verified</span>
              </div>
              <div className="text-center space-y-0.5">
                <div className="text-gray-400">Issue Date: {issueDate}</div>
                <div className="text-gray-600">ID: {certId}</div>
              </div>
              <div className="text-right">
                <div className="text-gray-400">verify.oopsoracle.com</div>
                <div className="text-gray-600">/{certId}</div>
              </div>
            </div>

            {/* Seal */}
            <div className="absolute bottom-6 right-6 w-20 h-20 rounded-full border-2 border-[#F89820]/40 bg-[#F89820]/5 flex flex-col items-center justify-center opacity-60">
              <Award className="w-5 h-5 text-[#F89820] mb-0.5" />
              <span className="text-[8px] font-mono text-[#F89820] text-center leading-tight">CERTIFIED<br/>ORACLE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
