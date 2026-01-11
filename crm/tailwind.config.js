/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
        	pageheader: 'hsl(var(--pageheader))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
			navbarbackground: 'hsl(var(--navbar-background))',
			bottombarbackground: 'hsl(var(--bottom-bar-background))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			calendar: {
  				accent: 'hsl(var(--calendar-accent))',
  				'accent-foreground': 'hsl(var(--calendar-accent-foreground))'
  			},
  			// Construction theme colors
  			slate: {
  				surface: 'hsl(var(--slate-surface))',
  				border: 'hsl(var(--slate-border))'
  			},
  			concrete: 'hsl(var(--concrete))',
  			steel: 'hsl(var(--steel))',
  			industrial: {
  				accent: 'hsl(var(--industrial-accent))'
  			}
  		},
			height: {
				navbar: 'var(--navbar-height)',
			},
			width: {
				sidebar: 'var(--sidebar-width)',
				notifications: 'var(--notifications-width)',
			}
			,
			
            keyframes: {
                "accordion-down": {
                  from: { height: "0" },
                  to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                  from: { height: "var(--radix-accordion-content-height)" },
                  to: { height: "0" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },

  	}
  },
  plugins: [require("tailwindcss-animate")],
}
