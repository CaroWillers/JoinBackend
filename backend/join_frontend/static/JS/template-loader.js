export class TemplateLoader {
    static async load(templateName, selector = "#content") {
        const container = document.querySelector(selector);
        if (!container) {
            console.warn(`❌ TemplateLoader: Container '${selector}' nicht gefunden.`);
            return;
        }

        const path = `/static/Templates/${templateName}.html`;

        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`Template '${templateName}' nicht gefunden (${response.status})`);
            }

            const html = await response.text();
            container.innerHTML = html;

            await TemplateLoader.waitForDOMReady(container);

            console.log(`✅ Template '${templateName}' erfolgreich geladen.`);
        } catch (error) {
            container.innerHTML = `<p class="error">Fehler beim Laden von <strong>${templateName}</strong>: ${error.message}</p>`;
            console.error("🛑 TemplateLoader Error:", error);
        }
    }

    static waitForDOMReady(container, timeout = 5000) {
        return new Promise((resolve, reject) => {
            let time = 0;
            const interval = 50;

            function check() {
                // Warte, bis Child-Elemente vorhanden sind
                if (container.children.length > 0) {
                    return resolve();
                }
                time += interval;
                if (time >= timeout) {
                    reject("⏳ Timeout: DOM wurde nicht rechtzeitig aufgebaut");
                } else {
                    setTimeout(check, interval);
                }
            }

            check();
        });
    }
}
