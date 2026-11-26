# 运行：cd cover && python3 render_cover.py  （生成两张 1920x1080 封面）
import asyncio, os
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--allow-file-access-from-files'])
        pg=await b.new_page(viewport={'width':1920,'height':1080})
        for v,name in [('A','下一帧_封面A_1920x1080.png'),('B','下一帧_封面B_1920x1080.png')]:
            await pg.goto('file://'+os.path.abspath('cover.html')+'?'+v); await pg.wait_for_timeout(1500)
            await pg.evaluate('document.fonts.ready'); await pg.screenshot(path=name)
        await b.close()
asyncio.run(main())
