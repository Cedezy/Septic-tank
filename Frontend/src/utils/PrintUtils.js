export const handlePrint = (ref, options = {}) => {
    const {
        title = 'Print Document',
        styles = {},
        windowFeatures = 'width=900,height=700,scrollbars=yes,resizable=yes',
        includeParentStyles = false,
        customCSS = '',
        customDate = '',
        onBeforePrint = null,
        onAfterPrint = null
    } = options;

    const printContent = ref.current;

    if (!printContent) {
        console.warn('Print content not found');
        return false;
    }

    // Execute before print callback
    if (onBeforePrint && typeof onBeforePrint === 'function') {
        onBeforePrint();
    }

    try {
        const printWindow = window.open('', '', windowFeatures);
        
        if (!printWindow) {
            throw new Error('Failed to open print window. Pop-up might be blocked.');
        }

        // Get existing stylesheets if requested
        let existingStyles = '';
        if (includeParentStyles) {
            const stylesheets = Array.from(document.styleSheets);
            stylesheets.forEach(stylesheet => {
                try {
                    const rules = Array.from(stylesheet.cssRules || stylesheet.rules || []);
                    existingStyles += rules.map(rule => rule.cssText).join('\n');
                } catch (e) {
                    // Skip stylesheets that can't be accessed (CORS)
                    console.warn('Could not access stylesheet:', e);
                }
            });
        }

        // Enhanced default styles
        const defaultStyles = {
            body: {
                fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
                fontSize: '14px',
                lineHeight: '1.5',
                color: '#374151',
                padding: '20px',
                margin: '0',
                backgroundColor: '#ffffff'
            },
            table: {
                width: '100%',
                borderCollapse: 'collapse',
                marginBottom: '20px',
                fontSize: '13px'
            },
            'th, td': {
                padding: '12px 8px',
                border: '1px solid #d1d5db',
                textAlign: 'left',
                verticalAlign: 'top'
            },
            th: {
                backgroundColor: '#f9fafb',
                fontWeight: '600',
                color: '#374151',
                borderBottom: '2px solid #d1d5db'
            },
            'tr:nth-child(even)': {
                backgroundColor: '#f9fafb'
            },
            h1: {
                fontSize: '24px',
                fontWeight: '700',
                marginBottom: '16px',
                color: '#111827'
            },
            h2: {
                fontSize: '20px',
                fontWeight: '600',
                marginBottom: '12px',
                color: '#374151'
            },
            h3: {
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#374151'
            },
            p: {
                marginBottom: '12px'
            },
            '.no-print': {
                display: 'none !important'
            },
             '.print-title': {
                fontSize: '15px',
                fontWeight: '600',
                textTransform: 'uppercase',
                color: '#111827',
            },
            '@media print': {
                body: {
                    padding: '0',
                    fontSize: '12px'
                },
                table: {
                    fontSize: '11px'
                },
                '.print-title': {
                    fontSize: '15px',
                },
                'th, td': {
                    padding: '8px 6px'
                },
                '.page-break': {
                    pageBreakAfter: 'always'
                },
                '.avoid-break': {
                    pageBreakInside: 'avoid'
                }
            }
        };

        // Merge custom styles with defaults
        const mergedStyles = { ...defaultStyles, ...styles };

        // Convert styles object to CSS string
        const generateCSS = (stylesObj) => {
            return Object.entries(stylesObj).map(([selector, rules]) => {
                if (typeof rules === 'object' && !Array.isArray(rules)) {
                    const cssRules = Object.entries(rules)
                        .map(([prop, value]) => `${prop.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`)
                        .join(' ');
                    return `${selector} { ${cssRules} }`;
                }
                return `${selector} { ${rules} }`;
            }).join('\n');
        };

        const compiledCSS = generateCSS(mergedStyles);

        // Create the print document
        const printHTML = `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>${title}</title>
                    <style>
                        ${existingStyles}
                        ${compiledCSS}
                        ${customCSS}
                        .print-container{
                            display: flex;
                            align-items: center; 
                            justify-content: center;
                        }
                        .print-header {
                            display: flex;
                            align-items: center; 
                            justify-content: center;          
                        }

                        .print-header img {
                            width: 130px;
                            height: 130px;
                            object-fit: contain;
                            margin-right: 10px;
                        }
                        
                        .header-text{
                            line-height: 8px;
                            margin-top: 15px;
                        }

                        .print-header .header-text h1 {
                            font-size: 20px;
                            margin: 0;
                            font-weight: bold;
                        }

                        .print-header .header-text p {
                            font-size: 12px;
                            color: #555;
                        }

                    </style>
                </head>
                <body>
                    <div class="print-container">
                        <div class="print-header">
                            <img src="/logo.png" alt="Logo" />
                            <div class="header-text">
                                <h1>Septic Tank Cleaning System</h1>
                                <p>Pagadian City, Zamboanga del Sur, 7016</p>
                                ${customDate ? `<p>As of ${customDate}</p>` : ''}
                            </div>
                        </div>
                    </div>
                    ${printContent.innerHTML}
                </body>
            </html>
        `;


        printWindow.document.write(printHTML);
        printWindow.document.close();

        // Wait for content to load before printing
        printWindow.onload = () => {
            printWindow.focus();
            
            // Small delay to ensure styles are applied
            setTimeout(() => {
                printWindow.print();
                
                // Execute after print callback
                if (onAfterPrint && typeof onAfterPrint === 'function') {
                    onAfterPrint();
                }
                
                // Close window after printing (optional)
                setTimeout(() => {
                    printWindow.close();
                }, 100);
            }, 250);
        };

        return true;

    } catch (error) {
        console.error('Print failed:', error);
        
        // Fallback to browser's native print
        if (confirm('Print window failed to open. Use browser print instead?')) {
            window.print();
        }
        
        return false;
    }
};
