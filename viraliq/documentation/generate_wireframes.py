"""Generate documentation diagrams, not screenshots of a running application."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
OUT=Path(__file__).parent/'images'
OUT.mkdir(exist_ok=True)
FONT='C:/Windows/Fonts/segoeui.ttf'
def render(name,title,subtitle,blocks):
    image=Image.new('RGB',(420,900),'#090f1d');d=ImageDraw.Draw(image)
    def text(x,y,t,size=16,color='#f4f7ff'):
        d.text((x,y),t,font=ImageFont.truetype(FONT,size),fill=color)
    text(25,22,'9:41                                      DEMO',13,'#96a6c1')
    text(25,66,'VIRALIQ / RESEARCH STUDIO',11,'#438bff')
    text(25,92,title,28);text(25,137,subtitle,14,'#96a6c1')
    y=186
    for heading,lines,height in blocks:
        d.rounded_rectangle((22,y,398,y+height),radius=17,fill='#141e30',outline='#283650')
        text(39,y+16,heading,18)
        for j,line in enumerate(lines):text(39,y+52+j*27,line,14,'#96a6c1')
        y+=height+15
    d.rectangle((0,823,420,900),fill='#141e30')
    for i,t in enumerate(['Home','Analyze','Results','Generate','History']):
        text(13+i*83,849,t,13,'#438bff' if t.lower()==name else '#96a6c1')
    text(25,793,'WIREFRAME / illustrative values',11,'#96a6c1')
    image.save(OUT/f'{name}.png')
render('home','Find the signal.','Create with intention.',[
 ('Active research',['Technology / AI tools','50 posts analyzed  |  Demo','Captured today, 10:30 AM'],151),
 ('Your library',['4 datasets                12 saved drafts'],99),
 ('Analyze a topic  →',[],67),('Generate original posts  ✦',[],67),
 ('Research, with perspective.',['Patterns inform creativity.','Performance is never guaranteed.'],127)])
render('analyze','Discover the signal','New research / Demo mode',[
 ('Topic',['Technology    Gaming    Science','Custom keyword: AI tools'],126),
 ('Timeframe',['1 hour   6 hours   24 hours   7 days'],98),
 ('Requested posts',['25     50     100     250     500'],98),
 ('Filters',['Highest engagement','Any media / Text / Images only'],125),
 ('Start Analysis  →',[],66)])
render('results','Technology','Demo research / Captured today',[
 ('Dataset overview',['50 collected / 50 requested','Last 24h / Any media'],125),
 ('Statistics',['Average likes       682.4','Average reposts    104.1','Measured engagement   42,300'],151),
 ('Conversation keywords',['AI tools       ━━━━━━━━━','Experiments  ━━━━━━','Learning      ━━━━'],151),
 ('Generate from this dataset  →',[],66)])
render('generate','Create something original','Local template generation',[
 ('Technology',['50 posts / Demo dataset','Captured today / 2 hours ago'],124),
 ('Your direction',['Write a funny post about AI tools...','Keyboard dictation supported'],125),
 ('Generation settings',['Casual / Medium / 3 variations'],98),
 ('Editable variation',['Plot twist: AI tools need a day off.','45 / 280 weighted characters','Save draft   |   Copy   |   Share'],151)])
render('history','Your research library','Saved on this device.',[
 ('Datasets     |     Saved Drafts',[],66),
 ('Technology / Active',['Demo / 50 posts / Today','Highest engagement / Any media','Open results   |   Delete'],151),
 ('Science',['Demo / 100 posts / Yesterday','All matching / Text-only','Set active   |   Compare'],151),
 ('External content controls',['Delete by post ID','Clear retained live content'],126)])
