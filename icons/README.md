# Ícones do PWA

Para que o PWA funcione corretamente e passe na validação das lojas, você precisa adicionar os arquivos de ícone nesta pasta.

O `manifest.json` está configurado para procurar os seguintes arquivos aqui:

1.  **`icon-192.png`** (192x192 pixels) - Ícone padrão para telas menores/homescreen.
2.  **`icon-512.png`** (512x512 pixels) - Ícone de alta resolução (Splash screen, lojas).
3.  **`maskable-icon-512.png`** (512x512 pixels) - Ícone "maskable" (preenche todo o quadrado sem fundo transparente nas bordas).

### Como gerar:
Você pode usar sites como [PWA Builder Image Generator](https://www.pwabuilder.com/imageGenerator) ou extensões do VS Code para gerar esses PNGs a partir do seu `icon.svg` que está na raiz do projeto.

Após gerar as imagens, salve-as nesta pasta (`/icons/`) com os nomes acima.