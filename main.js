// 전역 변수 선어
let headers = [];
let dataFields = [];
let trailers = [];
let header = '';
let trailer = '';
let dataLines = [];
const linesPerPage = 30;
let currentPage = 1;
let totalPages = 1;

// DOM 요소
let tableHeader;
let tableBody;
let pagination;

// 전역 함수 정의

/**
 * URL 파라미터를 업데이트하여 현재 정의된 헤더, 데이터, 트레일러를 저장합니다.
 */
function updateURLParameters() {
  const params = new URLSearchParams();

  params.set('header', encodeURIComponent(JSON.stringify(headers)));
  params.set('data', encodeURIComponent(JSON.stringify(dataFields)));
  params.set('trailer', encodeURIComponent(JSON.stringify(trailers)));

  const newURL = `${window.location.pathname}?${params.toString()}`;
  history.replaceState(null, '', newURL);
}

/**
 * URL 파라미터에서 정의된 헤더, 데이터, 트레일러를 로드하여 테이블을 초기화합니다.
 */
function loadDefinitionsFromURL() {
  const params = new URLSearchParams(window.location.search);

  if (params.has('header')) {
    headers = JSON.parse(decodeURIComponent(params.get('header')));
    renderFields('header');
  }

  if (params.has('data')) {
    dataFields = JSON.parse(decodeURIComponent(params.get('data')));
    renderFields('data');
  }

  if (params.has('trailer')) {
    trailers = JSON.parse(decodeURIComponent(params.get('trailer')));
    renderFields('trailer');
  }
}

/**
 * 필드를 추가하는 함수
 * @param {string} type - 'header', 'data', 또는 'trailer'
 */
function addField(type) {
  let length, name, fieldsArray;

  if (type === 'header') {
    length = document.querySelector('.header-length').value;
    name = document.querySelector('.header-name').value;
    fieldsArray = headers;
  } else if (type === 'data') {
    length = document.querySelector('.data-length').value;
    name = document.querySelector('.data-name').value;
    fieldsArray = dataFields;
  } else if (type === 'trailer') {
    length = document.querySelector('.trailer-length').value;
    name = document.querySelector('.trailer-name').value;
    fieldsArray = trailers;
  }

  if (length && name) {
    fieldsArray.push({ length: parseInt(length), name: name });
    renderFields(type);
    document.querySelector(`.${type}-length`).value = '';
    document.querySelector(`.${type}-name`).value = '';
    updateURLParameters(); // 변경 사항 반영
  }
}

/**
 * 필드를 제거하는 함수
 * @param {string} type - 'header', 'data', 또는 'trailer'
 * @param {number} index - 제거할 필드의 인덱스
 */
function removeField(type, index) {
  if (type === 'header') {
    headers.splice(index, 1);
  } else if (type === 'data') {
    dataFields.splice(index, 1);
  } else if (type === 'trailer') {
    trailers.splice(index, 1);
  }
  renderFields(type);
  if (type === 'data') {
    renderTable(); // 데이터 필드가 변경되면 테이블도 다시 렌더링
  }
  updateURLParameters(); // 변경 사항 반영
}

/**
 * 테이블을 초기화하고 5개의 빈 행을 추가하는 함수
 * @param {string} type - 'header', 'data', 또는 'trailer'
 */
function clearTable(type) {
  if (confirm('정말로 모든 데이터를 지우시겠습니까?')) {
    let table;
    if (type === 'header') {
      headers = [];
      table = $('#headerTable').DataTable();
    } else if (type === 'data') {
      dataFields = [];
      table = $('#dataTableInput').DataTable();
    } else if (type === 'trailer') {
      trailers = [];
      table = $('#trailerTable').DataTable();
    }

    // 모든 데이터 제거
    table.clear().draw();

    // 초기 빈 행 5개 추가
    for (let i = 0; i < 5; i++) {
      let inputName, inputLength;
      if (type === 'header') {
        inputName = 'header-name';
        inputLength = 'header-length';
      } else if (type === 'data') {
        inputName = 'data-name';
        inputLength = 'data-length';
      } else if (type === 'trailer') {
        inputName = 'trailer-name';
        inputLength = 'trailer-length';
      }

      table.row.add([
        '', // no는 rowCallback에서 처리
        `<input type="text" class="form-control ${inputName}" placeholder="이름">`,
        `<input type="number" class="form-control ${inputLength}" placeholder="길이">`,
        `<button class="btn btn-danger btn-sm text-light" onclick="removeRow(this)" title="삭제">
                    <i class="bi bi-trash"></i>
                </button>`
      ]).draw(false);
    }

    updateURLParameters(); // 변경 사항 반영
  }
}

/**
 * 필드를 렌더링하여 테이블을 업데이트하는 함수
 * @param {string} type - 'header', 'data', 또는 'trailer'
 */
function renderFields(type) {
  let table;
  let fieldsArray;

  if (type === 'header') {
    table = $('#headerTable').DataTable();
    fieldsArray = headers;
  } else if (type === 'data') {
    table = $('#dataTableInput').DataTable();
    fieldsArray = dataFields;
  } else if (type === 'trailer') {
    table = $('#trailerTable').DataTable();
    fieldsArray = trailers;
  }

  // 현재 테이블 데이터 초기화
  table.clear().draw();

  // 필드 추가
  fieldsArray.forEach((field, index) => {
    table.row.add([
      '', // no는 rowCallback에서 처리
      `<input type="text" class="form-control ${type}-name ${field.name ? 'bg-success-subtle' : ''}" placeholder="이름" value="${field.name || ''}">`,
      `<input type="number" class="form-control ${type}-length ${field.length ? 'bg-success-subtle' : ''}" placeholder="길이" value="${field.length || ''}">`,
      `<button class="btn btn-danger btn-sm text-light" onclick="removeRow(this)" title="삭제">
                <i class="bi bi-trash"></i>
            </button>`
    ]).draw(false);
  });

  // 빈 행 채우기
  for (let i = fieldsArray.length; i < 5; i++) {
    let inputName, inputLength;
    if (type === 'header') {
      inputName = 'header-name';
      inputLength = 'header-length';
    } else if (type === 'data') {
      inputName = 'data-name';
      inputLength = 'data-length';
    } else if (type === 'trailer') {
      inputName = 'trailer-name';
      inputLength = 'trailer-length';
    }

    table.row.add([
      '', // no는 rowCallback에서 처리
      `<input type="text" class="form-control ${inputName}" placeholder="이름">`,
      `<input type="number" class="form-control ${inputLength}" placeholder="길이">`,
      `<button class="btn btn-danger btn-sm text-light" onclick="removeRow(this)" title="삭제">
                <i class="bi bi-trash"></i>
            </button>`
    ]).draw(false);
  }

  // 합계 계산 및 표시
  calculateAndDisplaySum(type);
}

/**
 * 길이의 합계를 계산하여 합계 행에 표시하는 함수
 * @param {string} type - 'header', 'data', 'trailer', 또는 'dataTable'
 */
function calculateAndDisplaySum(type) {
  let sum = 0;
  let fieldsArray;

  if (type === 'header') {
    fieldsArray = headers;
  } else if (type === 'data') {
    fieldsArray = dataFields;
  } else if (type === 'trailer') {
    fieldsArray = trailers;
  } else if (type === 'dataTable') {
    // dataTableSum은 별도의 로 필요 시 수정
    return;
  }

  fieldsArray.forEach(field => {
    if (field.length && !isNaN(field.length)) {
      sum += parseInt(field.length);
    }
  });

  let sumId;
  if (type === 'header') {
    sumId = '#headerSum';
  } else if (type === 'data') {
    sumId = '#dataSum';
  } else if (type === 'trailer') {
    sumId = '#trailerSum';
  }

  if (sumId) {
    $(sumId).text(sum);
  }
}

/**
 * 데이터를 엑셀로 내보내는 함수
 */
function exportToExcel() {
  // 엑셀 내보내기 기능 구현
  // 필요에 따라 구현 내용을 추가하세요.
  alert('엑셀 내보내기 기능은 아직 구현되지 않았습니다.');
}

/**
 * 클립보드에서 데이터를 붙여넣을 때 처리하는 함수
 * @param {Event} e - 이벤트 객체
 * @param {Object} table - DataTable 객체
 * @param {string} type - 'header', 'data', 또는 'trailer'
 */
function handlePaste(e, table, type) {
  e.preventDefault();

  const clipboardData = e.originalEvent.clipboardData || window.clipboardData;
  const pastedData = clipboardData.getData('Text');

  // 데이터 가공 (탭 또는 쉼표로 구분된 데이터)
  const rows = pastedData.trim().split(/\r?\n/);

  let fieldsArray;

  if (type === 'header') {
    fieldsArray = headers;
  } else if (type === 'data') {
    fieldsArray = dataFields;
  } else if (type === 'trailer') {
    fieldsArray = trailers;
  }

  rows.forEach(row => {
    const cells = row.split(/\t|,/); // 탭 또는 쉼표로 구분
    if (cells.length >= 2) { // 최소 이름과 길이 필요
      const name = cells[0].trim();
      const length = parseInt(cells[1].trim());

      if (name && !isNaN(length)) {
        // 먼저 빈 필드 찾기
        let emptyIndex = fieldsArray.findIndex(field => !field.name && !field.length);
        if (emptyIndex !== -1) {
          // 기존 빈 필드 덮어쓰기
          fieldsArray[emptyIndex] = { name, length };
        } else {
          // 새로운 필드 추가
          fieldsArray.push({ name, length });
        }
      }
    }
  });

  renderFields(type);
  updateURLParameters(); // 변경 사항 반영
}

// 파일 업로드 이벤트 리스너 추가
document.getElementById('fileInput').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const content = e.target.result;
      processFileContent(content);
    };
    reader.readAsText(file, 'MS949'); // MS949 인코딩으로 파일 읽기
  }
});

/**
 * 파일 내용을 처리하고 테이블에 표시하는 함수
 * @param {string} content - 파일의 내용
 */
function processFileContent(content) {
  // 데이터 초기화
  const headerLines = [];
  const dataLines = [];
  const trailerLines = [];

  // 파일 내용을 줄 단위로 분할하고 빈 줄 제거 (trim 제거)
  const lines = content.split('\n').filter(line => line !== '');

  // 스트림 처리를 위한 인덱스
  let currentIndex = 0;
  const CHUNK_SIZE = 30;

  function processNextChunk() {
    // 현재 청크의 끝 인덱스 계산
    const endIndex = Math.min(currentIndex + CHUNK_SIZE, lines.length);

    // 현재 청크의 라인들 처리
    for (let i = currentIndex; i < endIndex; i++) {
      const line = lines[i];
      const type = line.charAt(0);

      switch (type) {
        case 'H':
          headerLines.push(line);
          break;
        case 'D':
          dataLines.push(line);
          break;
        case 'T':
          trailerLines.push(line);
          break;
      }
    }

    // 각 타입별 데이터 렌더링
    renderTypeTable('header', headerLines, headers);
    renderDataTableWithPaging(dataLines);
    renderTypeTable('trailer', trailerLines, trailers);

    // 다음 청크가 있는지 확인
    currentIndex = endIndex;
    if (currentIndex < lines.length) {
      // 다음 청크 처리를 위해 setTimeout 사용
      setTimeout(processNextChunk, 0);
    }
  }

  // 첫 번째 청크 처리 시작
  processNextChunk();
}

/**
 * 문자열을 MS949 바이트로 변환하는 함수
 * @param {string} str - 변환할 문자열
 * @returns {number[]} 바이트 배열
 */
function stringToMs949Bytes(str) {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  const ms949Bytes = [];

  for (let i = 0; i < str.length; i++) {
    const char = str.charAt(i);
    if (char.match(/[ㄱ-ㅎㅏ-ㅣ가-힣]/)) {
      // 한글은 2바이트
      ms949Bytes.push(bytes[i * 2], bytes[i * 2 + 1]);
    } else {
      // 영숫자는 1바이트
      ms949Bytes.push(bytes[i]);
    }
  }

  return ms949Bytes;
}

/**
 * MS949 바이트 배열에서 지정된 위치와 길이만큼 문자열을 추출하는 함수
 * @param {number[]} bytes - MS949 바이트 배열
 * @param {number} start - 시작 위치
 * @param {number} length - 추출할 길이
 * @returns {string} 추출된 문자열
 */
function ms949BytesToString(bytes, start, length) {
  const slice = bytes.slice(start, start + length);
  return new TextDecoder('euc-kr').decode(new Uint8Array(slice));
}

/**
 * 공백을 중간점으로 변환하는 함수
 * @param {string} text - 변환할 텍스트
 * @returns {string} 공백이 중간점으로 변환된 텍스트
 */
function highlightWhitespace(text) {
  return text.replace(/ /g, '·');
}

/**
 * CP949 문자열을 UTF-8로 변환하는 함수
 * @param {string} cp949 - CP949 문자열
 * @returns {string} UTF-8로 변환된 문자열
 */
function toUtf8(cp949) {
  return new TextDecoder('euc-kr').decode(new TextEncoder('utf-8').encode(cp949));
}

/**
 * 타입별 테이블을 렌더링하는 함수 수정
 */
function renderTypeTable(type, lines, fields) {
  const tableId = `${type}ResultTable`;
  let table = document.getElementById(tableId);

  // 테이블이 없으면 생성
  if (!table) {
    const container = document.createElement('div');
    container.className = 'mb-3';
    container.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h4 class="mb-0">${type.charAt(0).toUpperCase() + type.slice(1)} 데이터</h4>
        <span class="text-muted">총 길이: <span id="${type}TotalLength">0</span></span>
      </div>
      <table class="table table-sm table-hover table-bordered" id="${tableId}">
        <thead>
          <tr>
            ${fields.map(field => `<th>${field.name} (${field.length})</th>`).join('')}
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    `;

    // 테이블 위치 설정
    const dataTable = document.getElementById('dataTable').parentNode;
    if (type === 'header') {
      dataTable.parentNode.insertBefore(container, dataTable);
    } else {
      dataTable.parentNode.insertBefore(container, dataTable.nextSibling);
    }

    table = document.getElementById(tableId);
  }

  // 테이블 헤더 업데이트
  const headerRow = table.querySelector('thead tr');
  headerRow.innerHTML = fields.map(field => `<th>${field.name} (${field.length})</th>`).join('');

  // 테이블 바디 생성
  const tableBody = table.querySelector('tbody');
  tableBody.innerHTML = '';

  // 데이터 행 추가
  let totalLength = 0;
  lines.forEach((line, index) => {
    const lineBytes = stringToMs949Bytes(line);
    const rowLength = lineBytes.length;
    let currentPosition = 0;

    // 첫 번째 행: 파싱된 데이터
    const dataRow = document.createElement('tr');
    fields.forEach((field, fieldIndex) => {
      const value = ms949BytesToString(lineBytes, currentPosition, field.length);
      dataRow.innerHTML += `
        <td 
          data-start="${currentPosition}" 
          data-length="${field.length}"
          onmouseover="highlightOriginalData(this, ${currentPosition}, ${field.length})"
          onmouseout="removeHighlight(this)"
        >${value}</td>
      `;
      currentPosition += field.length;
    });
    tableBody.appendChild(dataRow);

    // 두 번째 행: 원본 데이터와 길이 (공백 강조 추가)
    const rawRow = document.createElement('tr');
    const expectedLength = dataFields.reduce((sum, field) => sum + field.length, 0);
    const isLengthMismatch = rowLength !== expectedLength;

    rawRow.className = `table-secondary ${isLengthMismatch ? 'table-danger' : ''}`;
    rawRow.innerHTML = `
      <td class="text-end align-middle">
        <span class="text-muted">${rowLength}</span>
      </td>
      <td colspan="${dataFields.length - 1}">
        <div class="d-flex">
          <div><pre class="m-0"><span class="text-body-secondary">${highlightWhitespace(line)}</span></pre></div>
        </div>
        <div>
          <pre class="m-0"><span class="text-bg-info">${toUtf8(line)}</span></pre>
        </div>
      </td>
    `;
    tableBody.appendChild(rawRow);

    totalLength += rowLength;
  });

  // 총 길이 업데이트
  const totalLengthElement = document.getElementById(`${type}TotalLength`);
  if (totalLengthElement) {
    totalLengthElement.textContent = totalLength;
  }

  // 데이터가 없는 경우 메시지 표시
  if (lines.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `<td colspan="${fields.length}" class="text-center">데이터가 없습니다.</td>`;
    tableBody.appendChild(emptyRow);
  }
}

/**
 * 데이터 테이블을 페이징과 함께 렌더링하는 함수
 * @param {string[]} lines - 데이터 라인 배열
 */
function renderDataTableWithPaging(lines) {
  // 전역 변수 업데이트
  dataLines = lines;
  totalPages = Math.ceil(lines.length / linesPerPage);
  currentPage = 1;

  // 데이터 테이블 컨테이너 생성 또는 가져오기
  let dataContainer = document.getElementById('dataTableContainer');
  if (!dataContainer) {
    dataContainer = document.createElement('div');
    dataContainer.id = 'dataTableContainer';
    dataContainer.className = 'mb-3';
    dataContainer.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h4 class="mb-0">Data 데이터</h4>
                <span class="text-muted">총 길이: <span id="totalLength">0</span></span>
            </div>
            <table class="table table-sm table-hover table-bordered" id="dataTable">
                <thead>
                    <tr>
                        <th>길이</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
            <nav>
                <ul class="pagination justify-content-center" id="pagination"></ul>
            </nav>
        `;

    // 헤더 테이블 다음에 삽입
    const headerTable = document.getElementById('headerResultTable');
    if (headerTable) {
      headerTable.parentNode.after(dataContainer);
    }
  }

  // 데이터 테이블 렌더링
  renderDataTable();

  // 페이지네이션 업데이트
  updatePagination();

  // 총 길이 계산 및 표시
  updateTotalLength();
}

/**
 * 총 길이를 계산하고 표시하는 함수
 */
function updateTotalLength() {
  let totalLength = 0;
  dataFields.forEach(field => {
    if (field.length) {
      totalLength += parseInt(field.length);
    }
  });

  const totalLengthElement = document.getElementById('totalLength');
  if (totalLengthElement) {
    totalLengthElement.textContent = totalLength;
  }
}

/**
 * 데이터 테이블 렌더링 함수 수정
 */
function renderDataTable() {
  const table = document.getElementById('dataTable');

  // 테이블 헤더 생성
  const headerRow = table.querySelector('thead tr');
  headerRow.innerHTML = dataFields.map(field => `<th>${field.name} (${field.length})</th>`).join('');

  // 테이블 바디 생성
  const tableBody = table.querySelector('tbody');
  tableBody.innerHTML = '';

  // 현재 페이지의 데이터 표시
  const startIndex = (currentPage - 1) * linesPerPage;
  const endIndex = Math.min(startIndex + linesPerPage, dataLines.length);

  for (let i = startIndex; i < endIndex; i++) {
    const line = dataLines[i];
    const lineBytes = stringToMs949Bytes(line);
    const rowLength = lineBytes.length;
    let currentPosition = 0;

    // 첫 번째 행: 파싱된 데이터
    const dataRow = document.createElement('tr');
    dataFields.forEach(field => {
      const value = ms949BytesToString(lineBytes, currentPosition, field.length);
      dataRow.innerHTML += `
        <td 
          data-start="${currentPosition}" 
          data-length="${field.length}"
          onmouseover="highlightOriginalData(this, ${currentPosition}, ${field.length})"
          onmouseout="removeHighlight(this)"
        >${value}</td>
      `;
      currentPosition += field.length;
    });
    tableBody.appendChild(dataRow);

    // 두 번째 행: 원본 데이터와 길이
    const rawRow = document.createElement('tr');
    const expectedLength = dataFields.reduce((sum, field) => sum + field.length, 0);
    const isLengthMismatch = rowLength !== expectedLength;

    rawRow.className = `table-secondary ${isLengthMismatch ? 'table-danger' : ''}`;
    rawRow.innerHTML = `
      <td class="text-end align-middle">
        <span class="text-muted">${rowLength}</span>
      </td>
      <td colspan="${dataFields.length - 1}">
        <div class="d-flex">
          <pre class="m-0"><span class="text-body-secondary">${highlightWhitespace(line)}</span></pre>
        </div>
        <div>
          <pre class="m-0"><span class="text-bg-info">${toUtf8(line)}</span></pre>
        </div>
      </td>
    `;
    tableBody.appendChild(rawRow);
  }

  // 데이터가 없는 경우 메시지 표시
  if (dataLines.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `<td colspan="${dataFields.length}" class="text-center">데이터가 없습니다.</td>`;
    tableBody.appendChild(emptyRow);
  }
}

/**
 * 페이지네이션을 업데이트하는 함수
 */
function updatePagination() {
  const pagination = document.getElementById('pagination');
  if (!pagination) return;

  pagination.innerHTML = '';

  // 이전 페이지 버튼
  const prevButton = document.createElement('li');
  prevButton.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
  prevButton.innerHTML = `
        <a class="page-link" href="#" onclick="event.preventDefault(); changePage(${currentPage - 1})" ${currentPage === 1 ? 'tabindex="-1" aria-disabled="true"' : ''}>
            이전
        </a>
    `;
  pagination.appendChild(prevButton);

  // 페이지 번호 버튼
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('li');
    pageButton.className = `page-item ${currentPage === i ? 'active' : ''}`;
    pageButton.innerHTML = `
            <a class="page-link" href="#" onclick="event.preventDefault(); changePage(${i})">
                ${i}
            </a>
        `;
    pagination.appendChild(pageButton);
  }

  // 다음 페이지 버튼
  const nextButton = document.createElement('li');
  nextButton.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
  nextButton.innerHTML = `
        <a class="page-link" href="#" onclick="event.preventDefault(); changePage(${currentPage + 1})" ${currentPage === totalPages ? 'tabindex="-1" aria-disabled="true"' : ''}>
            다음
        </a>
    `;
  pagination.appendChild(nextButton);
}

/**
 * 페이지를 변경하는 함수
 * @param {number} page - 이동할 페이지 번호
 */
function changePage(page) {
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderTable();
  updatePagination();
}

function renderTable() {
  if (!tableHeader || !tableBody || dataFields.length === 0) return;

  // 테이블 헤더 렌더링
  tableHeader.innerHTML = '';
  dataFields.forEach(field => {
    const th = document.createElement('th');
    th.textContent = field.name;
    th.style.fontFamily = 'Consolas, Monaco, "Courier New", monospace';
    tableHeader.appendChild(th);
  });

  // 테이블 바디 렌더링
  tableBody.innerHTML = '';
  const start = (currentPage - 1) * linesPerPage;
  const end = Math.min(start + linesPerPage, dataLines.length);
  const pageData = dataLines.slice(start, end);

  pageData.forEach(line => {
    const tr = document.createElement('tr');
    const parsedData = parseFixedLengthLine(line, dataFields);

    dataFields.forEach(field => {
      const td = document.createElement('td');
      td.textContent = parsedData[field.name] || '';
      td.style.fontFamily = 'Consolas, Monaco, "Courier New", monospace';
      td.style.whiteSpace = 'pre';
      tr.appendChild(td);
    });

    tableBody.appendChild(tr);
  });
}

/**
 * 원본 데이터에서 해당 영역을 하이라이트하는 함수
 * @param {HTMLElement} cell - hover된 td 엘리먼트
 * @param {number} start - 시작 위치 (바이트)
 * @param {number} length - 길이 (바이트)
 */
function highlightOriginalData(cell, start, length) {
  const row = cell.closest('tr');
  const rawRow = row.nextElementSibling;
  if (!rawRow) return;

  const originalText = rawRow.querySelector('pre span').textContent;
  const bytes = stringToMs949Bytes(originalText);

  // 바이트 단위로 문자열 자르기
  const beforeBytes = bytes.slice(0, start);
  const highlightBytes = bytes.slice(start, start + length);
  const afterBytes = bytes.slice(start + length);

  // 바이트 배열을 다시 문자열로 변환
  const before = ms949BytesToString(beforeBytes, 0, beforeBytes.length);
  const highlight = ms949BytesToString(highlightBytes, 0, highlightBytes.length);
  const after = ms949BytesToString(afterBytes, 0, afterBytes.length);

  rawRow.querySelector('pre span').innerHTML =
    `${before}<mark>${highlight}</mark>${after}`;
}

/**
 * 하이라이트를 제거하는 함수
 * @param {HTMLElement} cell - mouseout된 td 엘리먼트
 */
function removeHighlight(cell) {
  const row = cell.closest('tr');
  const rawRow = row.nextElementSibling;
  if (!rawRow) return;

  const originalText = rawRow.querySelector('pre span').textContent;
  rawRow.querySelector('pre span').innerHTML = originalText;
}

$(document).ready(function () {
  // DataTables 초기화
  const headerTable = $('#headerTable').DataTable({
    paging: false,
    searching: false,
    info: false,
    autoWidth: false,
    ordering: false,
    columnDefs: [
      { orderable: false, targets: '_all' }
    ],
    // 줄 번호 자동 업데이트 및 p-0, pe-1 클래스 추가
    rowCallback: function (row, data, index) {
      $('td', row).addClass('p-0');
      $('td:eq(0)', row).addClass('pe-1').html(index + 1);
    }
  });

  const dataTableInput = $('#dataTableInput').DataTable({
    paging: false,
    searching: false,
    info: false,
    autoWidth: false,
    ordering: false,
    columnDefs: [
      { orderable: false, targets: '_all' }
    ],
    rowCallback: function (row, data, index) {
      $('td', row).addClass('p-0');
      $('td:eq(0)', row).addClass('pe-1').html(index + 1);
    }
  });

  const trailerTable = $('#trailerTable').DataTable({
    paging: false,
    searching: false,
    info: false,
    autoWidth: false,
    ordering: false,
    columnDefs: [
      { orderable: false, targets: '_all' }
    ],
    rowCallback: function (row, data, index) {
      $('td', row).addClass('p-0');
      $('td:eq(0)', row).addClass('pe-1').html(index + 1);
    }
  });

  // URL 파라미터에서 정의 로드
  loadDefinitionsFromURL();

  // 각 테이블에 paste 이벤트 리스너 설정
  $('#headerTable tbody').on('paste', function (e) {
    handlePaste(e, headerTable, 'header');
  });

  $('#dataTableInput tbody').on('paste', function (e) {
    handlePaste(e, dataTableInput, 'data');
  });

  $('#trailerTable tbody').on('paste', function (e) {
    handlePaste(e, trailerTable, 'trailer');
  });
}); 