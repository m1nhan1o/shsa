require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.static('public'));

app.get('/api/meal', async (req, res) => {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const date = req.query.date || kst.toISOString().slice(0, 10).replace(/-/g, '');
  const url = 'https://open.neis.go.kr/hub/mealServiceDietInfo'
    + `?KEY=${process.env.NEIS_KEY}`
    + '&Type=json'
    + `&ATPT_OFCDC_SC_CODE=${process.env.OFFICE_CODE}`
    + `&SD_SCHUL_CODE=${process.env.SCHOOL_CODE}`
    + `&MLSV_YMD=${date}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));

    if (!data.mealServiceDietInfo) {
      return res.json({ meals: [] });
    }

    const rows = data.mealServiceDietInfo[1].row;
    const meals = rows.map(r => ({
      type: r.MMEAL_SC_NM,
      menu: r.DDISH_NM.split('<br/>').map(s => s.replace(/`/g, '').trim()),
      calories: r.CAL_INFO,
      nutrients: r.NTR_INFO ? r.NTR_INFO.split('<br/>') : [],
    }));
    res.json({ meals });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '급식 정보를 가져오지 못했어요' });
  }
});
app.get('/api/timetable', async (req, res) => {
  const { grade, classNm } = req.query;
  if (!grade || !classNm) {
    return res.status(400).json({ error: '학년과 반을 입력해줘' });
  }

  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const date = req.query.date || kst.toISOString().slice(0, 10).replace(/-/g, '');

  const url = 'https://open.neis.go.kr/hub/hisTimetable'
    + `?KEY=${process.env.NEIS_KEY}`
    + '&Type=json'
    + `&ATPT_OFCDC_SC_CODE=${process.env.OFFICE_CODE}`
    + `&SD_SCHUL_CODE=${process.env.SCHOOL_CODE}`
    + `&ALL_TI_YMD=${date}`
    + `&GRADE=${grade}`
    + `&CLASS_NM=${classNm}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    //console.log('시간표 응답:', JSON.stringify(data, null, 2));

    if (!data.hisTimetable) {
      return res.json({ periods: [] });
    }

    const rows = data.hisTimetable[1].row;
    const periods = rows
      .map(r => ({ period: Number(r.PERIO), subject: r.ITRT_CNTNT }))
      .sort((a, b) => a.period - b.period);

    res.json({ periods });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '시간표를 가져오지 못했어요' });
  }
});

const PORT = process.env.PORT || 3000;
   app.listen(PORT, () => console.log(`http://localhost:${PORT}`));