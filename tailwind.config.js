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
  			},
  			// Wind effects — amplitudes come from the --ws-bob-* vars index.scss
  			// sets per data-wind level, so one keyframe serves every strength.
  			// Clouds get two nested motions (horizontal sway + vertical bob) at
  			// different periods, so the drift reads as organic wandering instead
  			// of a single back-and-forth shuttle.
  			'weather-scene-sway': {
  				'0%,100%': { transform: 'translateX(0)' },
  				'30%': { transform: 'translateX(var(--ws-bob-x, 5px))' },
  				'65%': {
  					transform: 'translateX(calc(var(--ws-bob-x, 5px) * -0.55))'
  				}
  			},
  			'weather-scene-bob': {
  				'0%,100%': { transform: 'translateY(0)' },
  				'35%': { transform: 'translateY(calc(var(--ws-bob-y, 3px) * -0.8))' },
  				'70%': {
  					transform: 'translateY(calc(var(--ws-bob-y, 3px) * 0.45))'
  				}
  			},
  			'weather-scene-gust': {
  				'0%': { transform: 'translateX(-40cqw)', opacity: '0' },
  				'15%,80%': { opacity: '1' },
  				'100%': { transform: 'translateX(140cqw)', opacity: '0' }
  			},
  			'weather-scene-mist': {
  				'0%,100%': { transform: 'translateX(-8cqw)' },
  				'50%': { transform: 'translateX(8cqw)' }
  			},
  			'weather-scene-splash': {
  				'0%': { transform: 'scale(0.2)', opacity: '0.55' },
  				'100%': { transform: 'scale(1)', opacity: '0' }
  			},
  			// Thunder — two strikes per 8s cycle, second one weaker; the
  			// bolt flickers right after the first peak
  			'weather-scene-flash-double': {
  				'0%,84%,100%': { opacity: '0' },
  				'86%': { opacity: '0.4' },
  				'88%': { opacity: '0.1' },
  				'90%': { opacity: '0.32' },
  				'93%': { opacity: '0' },
  				'95%': { opacity: '0.22' },
  				'97%': { opacity: '0' }
  			},
  			'weather-scene-bolt': {
  				'0%,85%,93%,100%': { opacity: '0' },
  				'86%': { opacity: '1' },
  				'88%': { opacity: '0.3' },
  				'90%': { opacity: '1' }
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
  			'weather-scene-sway': 'weather-scene-sway 9s ease-in-out infinite',
  			'weather-scene-bob': 'weather-scene-bob 5.5s ease-in-out infinite',
  			'weather-scene-gust': 'weather-scene-gust 4s linear infinite',
  			'weather-scene-mist': 'weather-scene-mist 20s ease-in-out infinite',
  			'weather-scene-splash': 'weather-scene-splash 0.9s ease-out infinite',
  			'weather-scene-flash-double': 'weather-scene-flash-double 8s linear infinite',
  			'weather-scene-bolt': 'weather-scene-bolt 8s linear infinite',
  			'spin-slow': 'spin 12s linear infinite'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}