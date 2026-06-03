import { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, LogOut, Menu, X, Sparkles, User } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const navbarVariants = {
  hidden: { y: -80, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 120, damping: 20, delay: 0.1 }
  }
};

const drawerVariants = {
  hidden: { x: 320, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 140, damping: 22 }
  },
  exit: {
    x: 320,
    opacity: 0,
    transition: { duration: 0.22, ease: [0.4, 0, 1, 1] }
  }
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

const drawerItemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 130, damping: 18, delay: i * 0.07 }
  })
};

const iconButtonStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid var(--glass-border)',
  borderRadius: '12px',
  width: '44px',
  height: '44px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: 'var(--text-primary)',
};

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return null;

  const handleLogout = () => { setMobileMenuOpen(false); logout(); };

  return (
    <>
      <motion.header
        className="glass-panel main-navbar"
        variants={navbarVariants}
        initial="hidden"
        animate="visible"
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          right: '20px',
          height: '70px',
          padding: '0 30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 1000,
        }}
      >
        {/* LOGO */}
        <motion.div
          style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
          whileHover={{ scale: 1.03 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <motion.div
            animate={{ rotate: [0, 15, -10, 15, 0], scale: [1, 1.15, 1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
          >
            <Sparkles size={22} style={{ color: 'var(--accent-blue)' }} />
          </motion.div>
          <span className="gradient-text" style={{ fontWeight: '800', fontSize: '1.3rem', letterSpacing: '-0.5px' }}>
            JobAssistant
          </span>
        </motion.div>

        {/* DESKTOP NAV */}
        <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: '500' }}
          >
            <User size={14} />
            {user.email}
          </motion.div>

          <motion.button
            onClick={toggleTheme}
            style={iconButtonStyle}
            whileHover={{ scale: 1.08, background: 'rgba(255,255,255,0.1)' }}
            whileTap={{ scale: 0.92 }}
            aria-label="Toggle Theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              {theme === 'dark' ? (
                <motion.span
                  key="moon"
                  initial={{ rotate: -30, opacity: 0, scale: 0.7 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 30, opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.25 }}
                >
                  <Moon size={18} style={{ color: 'var(--accent-blue)' }} />
                </motion.span>
              ) : (
                <motion.span
                  key="sun"
                  initial={{ rotate: 30, opacity: 0, scale: 0.7 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: -30, opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.25 }}
                >
                  <Sun size={18} style={{ color: 'var(--accent-purple)' }} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          <motion.button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: '1px solid rgba(239,68,68,0.4)',
              borderRadius: '12px',
              padding: '10px 18px',
              color: '#ef4444',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
            }}
            whileHover={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.7)', scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogOut size={14} />
            Logout
          </motion.button>
        </nav>

        {/* HAMBURGER */}
        <motion.button
          className="mobile-trigger"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ ...iconButtonStyle, display: 'none' }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Toggle Navigation Menu"
        >
          <AnimatePresence mode="wait" initial={false}>
            {mobileMenuOpen ? (
              <motion.span key="close"
                initial={{ rotate: -45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 45, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X size={22} />
              </motion.span>
            ) : (
              <motion.span key="menu"
                initial={{ rotate: 45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -45, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu size={22} />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.header>

      {/* OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'fixed', top: 0, left: 0,
              width: '100vw', height: '100vh',
              backgroundColor: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              zIndex: 998,
            }}
          />
        )}
      </AnimatePresence>

      {/* DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.aside
            className="mobile-drawer glass-panel"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              position: 'fixed',
              top: '100px',
              right: '20px',
              width: '280px',
              maxHeight: 'calc(100vh - 120px)',
              zIndex: 999,
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            <motion.div custom={0} variants={drawerItemVariants} initial="hidden" animate="visible"
              style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
            >
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Logged in as</span>
              <span style={{ fontSize: '0.92rem', color: 'var(--text-primary)', fontWeight: '600', wordBreak: 'break-all', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={13} /> {user.email}
              </span>
            </motion.div>

            <motion.hr custom={1} variants={drawerItemVariants} initial="hidden" animate="visible"
              style={{ border: 'none', borderBottom: '1px solid var(--glass-border)', margin: '0' }}
            />

            <motion.div custom={2} variants={drawerItemVariants} initial="hidden" animate="visible"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Color Theme</span>
              <motion.button
                onClick={toggleTheme}
                style={iconButtonStyle}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.9 }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {theme === 'dark' ? (
                    <motion.span key="moon-m"
                      initial={{ rotate: -30, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 30, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Moon size={17} style={{ color: 'var(--accent-blue)' }} />
                    </motion.span>
                  ) : (
                    <motion.span key="sun-m"
                      initial={{ rotate: 30, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -30, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sun size={17} style={{ color: 'var(--accent-purple)' }} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>

            <motion.button
              custom={3} variants={drawerItemVariants} initial="hidden" animate="visible"
              onClick={handleLogout}
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.35)',
                borderRadius: '12px',
                padding: '13px',
                color: '#ef4444',
                fontWeight: '600',
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '4px',
              }}
              whileHover={{ background: 'rgba(239,68,68,0.15)', scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <LogOut size={15} />
              Logout
            </motion.button>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
