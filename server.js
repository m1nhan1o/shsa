require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.static('public'));

app.get('/api/meal', async (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10).replace(/-/g, '');

  const url = 'https://open.neis.go.kr/hub/mealServiceDietInfo'
    + `?KEY=${process.env.NEIS_KEY}`
    + '&Type=json'
    + `&ATPT_OFCDC_SC_CODE=${process.env.OFFICE_CODE}`
    + `&SD_SCHUL_CODE=${process.env.SCHOOL_CODE}`
    + `&MLSV_YMD=${date}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.mealServiceDietInfo) {
      return res.json({ meals: [] });
    }

    const rows = data.mealServiceDietInfo[1].row;
    const meals = rows.map(r => ({
      type: r.MMEAL_SC_NM,
      menu: r.DDISH_NM.split('<br/>'),
    }));
    res.json({ meals });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '급식 정보를 가져오지 못했어요' });
  }
});

app.listen(3000, () => console.log('http://localhost:3000'));