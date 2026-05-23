import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, KeyRound, Smartphone, AlertTriangle, CheckCircle, Loader2, Image } from 'lucide-react';
import api from '../api/api.service';

const Register: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [profilePicUrl, setProfilePicUrl] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Step 1: Send OTP to verify email address
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setError('Please provide your name and email address.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await api.post('/auth/send-mail-auth', { email });
      if (response.status === 201) {
        setSuccess('OTP has been sent to your email. Please check your inbox.');
        setStep(2);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP. Email might be already registered.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and finalize Registration
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !password) {
      setError('OTP and Password are required.');
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const payload = {
        name,
        email,
        password,
        otp,
        profilePicUrl: profilePicUrl || undefined
      };

      const response = await api.post('/auth/sign-up', payload);
      
      if (response.data?.success && response.data?.data) {
        const { accessToken, ...userProfile } = response.data.data;
        login(userProfile, accessToken);
        setSuccess('Registration completed successfully!');
        
        setTimeout(() => {
          navigate('/problems');
        }, 1000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification or sign up failed. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-darkBg p-6">
      <div className="w-full max-w-md bg-darkPanel border border-darkBorder p-8">
        
        {/* Title Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-mono font-bold tracking-tight text-white uppercase">RECRUIT_SIGNUP</h2>
          <p className="text-xs text-text-secondary mt-1 font-mono uppercase">
            {step === 1 ? 'STEP 1: IDENTITY VERIFICATION' : 'STEP 2: CREDENTIAL ASSIGNMENT'}
          </p>
        </div>

        {/* Messaging Feedback */}
        {error && (
          <div className="mb-6 flex items-start gap-2 bg-brandRed/10 border border-brandRed text-brandRed p-3.5 text-xs font-mono">
            <AlertTriangle className="shrink-0" size={16} />
            <div>
              <span className="font-bold">REGISTRATION_ERROR:</span> {error.toUpperCase()}
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-start gap-2 bg-brandGreen/10 border border-brandGreen text-brandGreen p-3.5 text-xs font-mono">
            <CheckCircle className="shrink-0" size={16} />
            <div>
              <span className="font-bold">SYSTEM_SUCCESS:</span> {success.toUpperCase()}
            </div>
          </div>
        )}

        {step === 1 ? (
          /* Step 1 Form */
          <form onSubmit={handleSendOtp} className="space-y-5">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold text-text-secondary uppercase">CODENAME_OR_FULL_NAME</label>
              <div className="relative flex items-center">
                <User className="absolute left-3 text-text-disabled" size={16} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-darkBg border border-darkBorder focus:border-brandBlue text-sm text-white placeholder-text-disabled outline-none font-mono"
                  placeholder="Osank Verma"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold text-text-secondary uppercase">EMAIL_COORDINATES</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 text-text-disabled" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-darkBg border border-darkBorder focus:border-brandBlue text-sm text-white placeholder-text-disabled outline-none font-mono"
                  placeholder="developer@lc.arena"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brandBlue hover:bg-[#2563eb] text-white py-3 px-4 font-mono font-bold text-sm tracking-widest uppercase transition-colors duration-150 ease-in-out border border-brandBlue hover:border-[#2563eb] cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>TRANSMITTING...</span>
                </>
              ) : (
                <span>SEND_VERIFICATION_OTP</span>
              )}
            </button>
          </form>
        ) : (
          /* Step 2 Form */
          <form onSubmit={handleSignUp} className="space-y-5">
            {/* Email (Read Only Display) */}
            <div className="space-y-1">
              <label className="block text-[10px] font-mono font-bold text-text-disabled uppercase">VERIFYING_ACCOUNT</label>
              <div className="px-3 py-2 bg-darkBg border border-darkBorder text-[#f3f4f6]/60 text-xs font-mono">
                {email}
              </div>
            </div>

            {/* OTP Code */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold text-text-secondary uppercase">4-DIGIT_OTP_CODE</label>
              <div className="relative flex items-center">
                <Smartphone className="absolute left-3 text-text-disabled" size={16} />
                <input
                  type="text"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-darkBg border border-darkBorder focus:border-brandBlue text-sm text-white tracking-widest placeholder-text-disabled outline-none font-mono"
                  placeholder="0000"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Secret key (Password) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold text-text-secondary uppercase">CHOOSE_SECRET_KEY</label>
              <div className="relative flex items-center">
                <KeyRound className="absolute left-3 text-text-disabled" size={16} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-darkBg border border-darkBorder focus:border-brandBlue text-sm text-white placeholder-text-disabled outline-none font-mono"
                  placeholder="••••••••••••"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Profile Picture URL */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold text-text-secondary uppercase">PROFILE_PICTURE_URL (OPTIONAL)</label>
              <div className="relative flex items-center">
                <Image className="absolute left-3 text-text-disabled" size={16} />
                <input
                  type="url"
                  value={profilePicUrl}
                  onChange={(e) => setProfilePicUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-darkBg border border-darkBorder focus:border-brandBlue text-sm text-white placeholder-text-disabled outline-none font-mono"
                  placeholder="https://..."
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setError(null);
                  setSuccess(null);
                }}
                className="w-1/3 bg-darkBg hover:bg-darkHeader border border-darkBorder text-[#f3f4f6] py-3 px-4 font-mono font-bold text-xs uppercase tracking-wider transition-colors duration-150 cursor-pointer"
                disabled={loading}
              >
                BACK
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 bg-brandBlue hover:bg-[#2563eb] text-white py-3 px-4 font-mono font-bold text-xs tracking-widest uppercase transition-colors duration-150 border border-brandBlue hover:border-[#2563eb] cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>AUTHENTICATING...</span>
                  </>
                ) : (
                  <span>SUBMIT_REGISTRY</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Login redirect link */}
        <div className="mt-8 pt-6 border-t border-darkBorder text-center">
          <p className="text-xs text-text-secondary font-mono">
            ALREADY_RECRUITED?{' '}
            <Link to="/login" className="text-brandBlue hover:underline font-bold uppercase">
              Login here
            </Link>
          </p>
        </div>
        
      </div>
    </div>
  );
};

export default Register;
