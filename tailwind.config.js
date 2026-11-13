/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		// Mobile is <768px everywhere: the `mobile:` variant mirrors the
  		// canonical useIsMobile() hook so JS and CSS never disagree.
  		screens: {
  			mobile: {
  				max: '767px'
  			}
  		},
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			// weather-* prefix avoids colliding with the global float/fade-in
  			// keyframes declared in src/App.css
  			'weather-float': {
  				'0%,100%': { transform: 'translateY(0)' },
  				'50%': { transform: 'translateY(-2px)' }
  			},
  			'weather-fade-in': {
  				from: { opacity: '0' },
  				to: { opacity: '1' }
  			},
  			'weather-pulse-soft': {
  				'0%,100%': { opacity: '1' },
  				'50%': { opacity: '0.55' }
  			},
  			'weather-rain': {
  				from: { backgroundPosition: '0 0' },
  				to: { backgroundPosition: '0 128px' }
  			},
  			'weather-drift': {
  				from: { backgroundPosition: '0% 0%' },
  				to: { backgroundPosition: '200% 0%' }
  			},
  			// Animated weather scene (sidebar) — uses cqh/cqw container units,
  			// the scene root is a [container-type:size] container
  			'weather-scene-fall': {
  				'0%': { transform: 'translateY(-10cqh)', opacity: '0' },
  				'12%': { opacity: '1' },
  				'100%': { transform: 'translateY(110cqh)', opacity: '1' }
  			},
  			'weather-scene-cloud': {
  				from: { transform: 'translateX(-30cqw)' },
  				to: { transform: 'translateX(130cqw)' }
  			},
  			'weather-scene-twinkle': {
  				'0%,100%': { opacity: '0.2' },
  				'50%': { opacity: '1' }
  			},
  			'weather-scene-flash': {
  				'0%,90%,100%': { opacity: '0' },
  				'92%': { opacity: '0.35' },
  				'94%': { opacity: '0.08' },
  				'96%': { opacity: '0.25' },
  				'98%': { opacity: '0' }
  			},
  			'weather-scene-orb-float': {
  				'0%,100%': { transform: 'translateY(0)' },
  				'50%': { transform: 'translateY(-6px)' }
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'weather-float': 'weather-float 3s ease-in-out infinite',
  			'weather-fade-in': 'weather-fade-in 0.8s ease-in-out',
  			'weather-pulse-soft': 'weather-pulse-soft 2.4s ease-in-out infinite',
  			'weather-rain': 'weather-rain 0.7s linear infinite',
  			'weather-drift': 'weather-drift 30s linear infinite',
  			'weather-scene-fall': 'weather-scene-fall 0.9s linear infinite',
  			'weather-scene-cloud': 'weather-scene-cloud 40s linear infinite',
  			'weather-scene-twinkle': 'weather-scene-twinkle 3s ease-in-out infinite',
  			'weather-scene-flash': 'weather-scene-flash 8s linear infinite',
  			'weather-scene-orb-float': 'weather-scene-orb-float 5s ease-in-out infinite',
  			'spin-slow': 'spin 12s linear infinite'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}