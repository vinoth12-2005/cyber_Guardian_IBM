// ============================================================
// SE-LAB — Social Media Attack Simulator
// Covers: Profile cloning, fake giveaways, account takeover,
// LinkedIn scams, Discord/Telegram crypto fraud, etc.
// ============================================================

import React, { useState } from 'react';
import {
  Heart, Share2, MessageCircle, Bookmark, MoreHorizontal,
  AlertTriangle, CheckCircle2, Flag, Shield, ExternalLink,
  ThumbsUp, Send, Search, Bell, Home, UserCheck, X,
  Gift, CreditCard, ChevronRight
} from 'lucide-react';
import { useSimulationStore } from '@/store/simulation-store';
import { toast } from 'sonner';

// ---- Instagram-style Giveaway Phishing ----
interface SocialMediaPost {
  id: string;
  platform: 'instagram' | 'twitter' | 'linkedin' | 'facebook' | 'discord';
  username: string;
  displayName: string;
  isVerified: boolean;
  isCloned?: boolean; // Profile cloning scenario
  avatar: string; // color for avatar
  content: string;
  imageDesc?: string;
  likes: number;
  comments: number;
  shares: number;
  time: string;
  isAttacker: boolean;
  attachedLink?: { label: string; url: string; safe: boolean };
  attachedForm?: { title: string; fields: string[] };
}

interface SocialMediaPortalProps {
  platform: 'instagram' | 'twitter' | 'linkedin' | 'facebook' | 'discord';
  posts: SocialMediaPost[];
  scenarioType: 'giveaway' | 'profile-clone' | 'account-takeover' | 'job-scam' | 'crypto-fraud';
  onFollowAttacker?: () => void;
  onClickLink?: () => void;
  onSubmitForm?: () => void;
  onDefend?: () => void;
}

const PLATFORM_STYLES = {
  instagram: {
    bg: 'bg-white',
    header: 'bg-white border-b border-gray-200',
    text: 'text-gray-900',
    accent: 'text-pink-600',
    buttonColor: 'bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500',
    name: 'Instagram',
    emoji: '📸',
  },
  twitter: {
    bg: 'bg-black',
    header: 'bg-black border-b border-slate-800',
    text: 'text-white',
    accent: 'text-sky-400',
    buttonColor: 'bg-sky-500',
    name: 'X (Twitter)',
    emoji: '𝕏',
  },
  linkedin: {
    bg: 'bg-[#f3f2ef]',
    header: 'bg-white border-b border-gray-200',
    text: 'text-gray-900',
    accent: 'text-blue-700',
    buttonColor: 'bg-blue-600',
    name: 'LinkedIn',
    emoji: 'in',
  },
  facebook: {
    bg: 'bg-[#f0f2f5]',
    header: 'bg-white border-b border-gray-200 shadow-sm',
    text: 'text-gray-900',
    accent: 'text-blue-600',
    buttonColor: 'bg-blue-600',
    name: 'Facebook',
    emoji: 'f',
  },
  discord: {
    bg: 'bg-[#313338]',
    header: 'bg-[#1e1f22] border-b border-[#1e1f22]',
    text: 'text-white',
    accent: 'text-indigo-400',
    buttonColor: 'bg-indigo-500',
    name: 'Discord',
    emoji: '🎮',
  },
};

export function SocialMediaPortal({
  platform,
  posts,
  scenarioType,
  onFollowAttacker,
  onClickLink,
  onSubmitForm,
  onDefend,
}: SocialMediaPortalProps) {
  const { fireEvent } = useSimulationStore();
  const [followed, setFollowed] = useState<Record<string, boolean>>({});
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [showForm, setShowForm] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [reported, setReported] = useState<Record<string, boolean>>({});
  const [linkClicked, setLinkClicked] = useState(false);
  const style = PLATFORM_STYLES[platform];

  const handleFollow = (post: SocialMediaPost) => {
    if (followed[post.id]) return;
    setFollowed(f => ({ ...f, [post.id]: true }));
    if (post.isAttacker) {
      fireEvent('FORM_FIELD_FOCUSED', {
        label: `Followed attacker's cloned profile: @${post.username}`,
        riskDelta: 10,
        scoreDelta: -5,
        attackerSees: `Victim followed fake account @${post.username} — will send DMs next`,
      });
      toast.warning('You followed a potentially cloned profile!');
      onFollowAttacker?.();
    } else {
      toast.success('Followed!');
    }
  };

  const handleLike = (post: SocialMediaPost) => {
    setLiked(f => ({ ...f, [post.id]: true }));
    if (post.isAttacker) {
      fireEvent('FORM_FIELD_FOCUSED', {
        label: 'Engaged with attacker post (liked)',
        riskDelta: 5,
        scoreDelta: -2,
        attackerSees: 'Victim liked attacker post — algorithm will boost visibility',
      });
    }
  };

  const handleClickLink = (post: SocialMediaPost) => {
    if (linkClicked) return;
    setLinkClicked(true);
    if (post.attachedLink && !post.attachedLink.safe) {
      fireEvent('LINK_OPENED', {
        label: `Clicked link from ${post.platform} post: ${post.attachedLink.url}`,
        riskDelta: 20,
        scoreDelta: -15,
        isBranch: true,
        attackerSees: `Victim navigated to phishing link: ${post.attachedLink.url}`,
        exposedData: ['Click event', 'Browser info (simulated)'],
        nextState: 'LINK_CLICKED',
      });
      toast.error('You clicked a suspicious link!');
      onClickLink?.();
      if (post.attachedForm) setShowForm(post.id);
    }
  };

  const handleSubmitForm = (postId: string) => {
    fireEvent('FORM_SUBMITTED', {
      label: 'Submitted personal data to social media phishing form',
      riskDelta: 30,
      scoreDelta: -20,
      isBranch: true,
      attackerSees: 'VICTIM DATA CAPTURED via social media giveaway form',
      exposedData: ['Name (simulated)', 'Email (simulated)', 'Phone (simulated)'],
      nextState: 'CREDENTIAL_CAPTURED',
    });
    setShowForm(null);
    toast.error('Personal data submitted to attacker!');
    onSubmitForm?.();
  };

  const handleReport = (post: SocialMediaPost) => {
    if (reported[post.id]) return;
    setReported(r => ({ ...r, [post.id]: true }));
    fireEvent('REPORT_FILED', {
      label: `Reported ${post.isAttacker ? 'attacker' : ''} post on ${platform}`,
      riskDelta: -20,
      scoreDelta: 20,
      isDefensive: true,
      isBranch: true,
      attackerSees: `Account @${post.username} reported — platform review triggered`,
    });
    toast.success('Post reported! Platform will review the account.');
    onDefend?.();
  };

  return (
    <div className={`h-full flex flex-col ${style.bg} overflow-hidden`}>
      {/* Platform Header */}
      <div className={`${style.header} px-3 py-2 flex items-center justify-between`}>
        <div className={`font-bold text-lg ${style.accent}`}>{style.name}</div>
        <div className="flex items-center gap-3">
          <Search className={`w-5 h-5 ${style.text} opacity-60`} />
          <Bell className={`w-5 h-5 ${style.text} opacity-60`} />
        </div>
      </div>

      {/* Warning banner */}
      {scenarioType === 'profile-clone' && (
        <div className="bg-amber-50 border-b border-amber-200 px-3 py-2 flex items-center gap-1.5 text-[11px] text-amber-800">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          <span><strong>Investigation:</strong> A profile has been cloned. Can you identify which account is fake?</span>
        </div>
      )}

      {/* Posts feed */}
      <div className="flex-1 overflow-y-auto">
        {posts.map(post => (
          <div key={post.id} className={`border-b ${platform === 'twitter' ? 'border-slate-800' : platform === 'discord' ? 'border-[#404249]' : 'border-gray-200'} p-3 space-y-2`}>
            {/* Post header */}
            <div className="flex items-start gap-2.5">
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white text-sm`}
                style={{ background: post.avatar }}>
                {post.displayName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 flex-wrap">
                  <span className={`font-bold text-sm ${style.text}`}>{post.displayName}</span>
                  {post.isVerified && (
                    <CheckCircle2 className={`w-3.5 h-3.5 ${style.accent} flex-shrink-0`} />
                  )}
                  {post.isCloned && (
                    <span className="text-[9px] bg-orange-100 text-orange-600 border border-orange-200 px-1 rounded font-bold">⚠ CLONED?</span>
                  )}
                  <span className={`text-[11px] ${platform === 'twitter' ? 'text-slate-400' : 'text-gray-500'}`}>@{post.username}</span>
                  <span className={`text-[10px] ${platform === 'twitter' ? 'text-slate-500' : 'text-gray-400'}`}>· {post.time}</span>
                </div>
              </div>
              {/* Actions */}
              <div className="flex items-center gap-1.5">
                {post.isAttacker && (
                  <button
                    onClick={() => handleReport(post)}
                    disabled={reported[post.id]}
                    className={`flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded transition ${
                      reported[post.id] ? 'text-emerald-500' : 'text-red-500 hover:bg-red-50'
                    }`}
                    title="Report this account"
                  >
                    <Flag className="w-3 h-3" />
                    {reported[post.id] ? 'Reported' : 'Report'}
                  </button>
                )}
                <button
                  onClick={() => handleFollow(post)}
                  className={`text-[11px] px-2.5 py-1 rounded-full font-bold transition ${
                    followed[post.id]
                      ? (platform === 'twitter' ? 'border border-slate-500 text-slate-300' : 'border border-gray-300 text-gray-600')
                      : `${style.buttonColor} text-white`
                  }`}
                >
                  {followed[post.id] ? 'Following' : 'Follow'}
                </button>
              </div>
            </div>

            {/* Post content */}
            <p className={`text-sm ${style.text} leading-relaxed`}>{post.content}</p>

            {/* Image placeholder */}
            {post.imageDesc && (
              <div className="w-full h-28 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center text-gray-500 text-sm border border-gray-200">
                🖼 {post.imageDesc}
              </div>
            )}

            {/* Attached link */}
            {post.attachedLink && (
              <button
                onClick={() => handleClickLink(post)}
                disabled={linkClicked}
                className={`w-full text-left border rounded-xl p-2.5 space-y-0.5 text-xs transition ${
                  post.attachedLink.safe
                    ? 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                    : 'border-red-200 bg-red-50 hover:bg-red-100'
                } ${linkClicked ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-semibold ${post.attachedLink.safe ? 'text-gray-700' : 'text-red-700'}`}>
                    {post.attachedLink.label}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <div className={`font-mono text-[10px] ${post.attachedLink.safe ? 'text-gray-500' : 'text-red-500'}`}>
                  {post.attachedLink.url}
                  {!post.attachedLink.safe && ' ⚠'}
                </div>
              </button>
            )}

            {/* Giveaway form overlay */}
            {showForm === post.id && post.attachedForm && (
              <div className="bg-white border border-red-200 rounded-xl p-3 space-y-2.5 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-red-600 font-bold text-sm">
                    <Gift className="w-4 h-4" /> {post.attachedForm.title}
                  </div>
                  <button onClick={() => { setShowForm(null); onDefend?.(); toast.success('Smart! You closed the suspicious form.'); }} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {post.attachedForm.fields.map((field, i) => (
                  <div key={i}>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">{field}</label>
                    <input
                      type={field.toLowerCase().includes('card') ? 'text' : 'text'}
                      placeholder={field}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                      onChange={e => setFormData(d => ({ ...d, [field]: e.target.value }))}
                    />
                  </div>
                ))}
                <button onClick={() => handleSubmitForm(post.id)} className="w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold text-sm transition">
                  Claim Prize →
                </button>
                <div className="text-[9px] text-gray-400 text-center">By claiming, you agree to our terms.</div>
              </div>
            )}

            {/* Engagement */}
            <div className={`flex items-center gap-4 pt-1 ${platform === 'twitter' ? 'text-slate-500' : 'text-gray-500'}`}>
              <button onClick={() => handleLike(post)} className="flex items-center gap-1 text-[11px] hover:text-red-500 transition">
                <Heart className={`w-3.5 h-3.5 ${liked[post.id] ? 'fill-red-500 text-red-500' : ''}`} />
                {(post.likes + (liked[post.id] ? 1 : 0)).toLocaleString()}
              </button>
              <button className="flex items-center gap-1 text-[11px] hover:text-blue-500 transition">
                <MessageCircle className="w-3.5 h-3.5" /> {post.comments.toLocaleString()}
              </button>
              <button className="flex items-center gap-1 text-[11px] hover:text-green-500 transition">
                <Share2 className="w-3.5 h-3.5" /> {post.shares.toLocaleString()}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Red flag educational banner */}
      <div className="border-t border-red-200 bg-red-50 px-3 py-2 text-[10px] text-red-700 flex items-start gap-1.5">
        <Shield className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
        <span>
          <strong>Red flags:</strong> Urgent prize claims, requests for credit card "shipping fees", accounts with recent creation dates, mismatched follower ratios, and unverified blue checkmarks are common social media scam indicators.
        </span>
      </div>
    </div>
  );
}
