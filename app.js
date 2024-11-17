const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 1000;

// 파일 업로드를 위한 Multer 설정
const upload = multer({ dest: 'uploads/' });

// 정적 파일 제공 설정
app.use(express.static('public'));

// 루트 경로에 대한 라우트
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// 파일 다운로드 엔드포인트
app.get('/download/:filename', (req, res) => {
  const fileName = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', fileName);
  
  res.download(filePath, fileName, (err) => {
    if (err) {
      res.status(500).send('Error downloading file');
    }
  });
});

// 업로드된 파일을 처리하여 파일 시스템에 저장하는 미들웨어
app.post('/upload', upload.single('app'), (req, res) => {
  // 업로드된 앱 정보
  const appName = req.body.name;
  const appFile = req.file;

  // 파일 정보를 읽어들여 파일 시스템에 저장
  fs.readFile(appFile.path, (err, data) => {
    if (err) {
      res.status(500).send('Error uploading file');
    } else {
      const newPath = `uploads/${appFile.originalname}`;
      fs.writeFile(newPath, data, (err) => {
        if (err) {
          res.status(500).send('Error uploading file');
        } else {
          res.send('File uploaded successfully');
        }
      });
    }
  });
});

// 앱 목록을 반환하는 엔드포인트
app.get('/apps', (req, res) => {
  fs.readdir('uploads', (err, files) => {
    if (err) {
      res.status(500).send('Error fetching apps');
    } else {
      // 파일 목록을 클라이언트에 반환
      res.json(files);
    }
  });
});

// 앱 검색을 위한 엔드포인트
app.get('/search', (req, res) => {
  const query = req.query.query.toLowerCase();
  fs.readdir('uploads', (err, files) => {
    if (err) {
      res.status(500).send('Error searching apps');
    } else {
      // 파일 목록 중에서 검색어를 포함하는 파일들을 필터링하여 반환
      const filteredFiles = files.filter(file => file.toLowerCase().includes(query));
      res.json(filteredFiles);
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
