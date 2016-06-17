<a name="1.32.1"></a>
## [1.32.1](https://github.com/tosslab/web_client/compare/v1.32.0...v1.32.1) (2016-06-17)


### Bug Fixes

* **cache:** 중간에 들어온 메시지가 랜더링 되지 않고 누락되는 현상 수정 ([7d7efc2](https://github.com/tosslab/web_client/commit/7d7efc2))



<a name="1.32.0"></a>
# [1.32.0](https://github.com/tosslab/web_client/compare/v1.31.3...v1.32.0) (2016-06-16)


### Bug Fixes

* **bubbleview:** filecard의 너비가 줄어들었을때 preview가 중앙정렬되도록 수정 ([795b4a0](https://github.com/tosslab/web_client/commit/795b4a0))
* **bubbleview:** zoom 조정 시 댓글 입력창이 잘리는 버그 수정 ([82f3c11](https://github.com/tosslab/web_client/commit/82f3c11))
* **bubbleview:** 파일 코멘트 사이 언리드 마커로 쓰레드가 잘렸을 경우, 마커 이후에 코멘트는 항상 작설자를 노출 ([6f19899](https://github.com/tosslab/web_client/commit/6f19899))
* **cache:** UnreadMarker 가 비정상적으로 노출되는 현상 수정 ([12673f5](https://github.com/tosslab/web_client/commit/12673f5))
* **filedrag:** 텍스트 드래그시 파일 업로드 이미지 출력되는 버그 수정 ([3029311](https://github.com/tosslab/web_client/commit/3029311))

### Features

* **deprecatedapp:** 더이상 지원하지 않는 app일경우 업데이트 완료하라는 popup을 account 정보 불러온 후 출력하도록 추가 ([485ad35](https://github.com/tosslab/web_client/commit/485ad35))



<a name="1.31.3"></a>
## [1.31.3](https://github.com/tosslab/web_client/compare/v1.31.2...v1.31.3) (2016-06-15)


### Bug Fixes

* **mention:** web_client 진입을 dm으로 하였을때 mention list가 생성되지 않는 버그 수정 ([f4d1302](https://github.com/tosslab/web_client/commit/f4d1302))



<a name="1.31.2"></a>
## [1.31.2](https://github.com/tosslab/web_client/compare/v1.31.1...v1.31.2) (2016-06-13)


### Bug Fixes

* **cache:** max-cache 로직 버그 수정 ([ec78e5f](https://github.com/tosslab/web_client/commit/ec78e5f))
* **cache:** message cache 의 request 보다 system event 가 빠르게 도달했을 경우 발생하는 오류 수정 ([f84abf4](https://github.com/tosslab/web_client/commit/f84abf4))
* **center:** POST 시 message 가 있는지 판단하는 로직에 예외처리 추가 ([2bc6265](https://github.com/tosslab/web_client/commit/2bc6265))
* **center:** 새로운 토픽 진입 시 scroll 위치 어긋나는 현상 수정 ([9b876c5](https://github.com/tosslab/web_client/commit/9b876c5))



<a name="1.31.1"></a>
## [1.31.1](https://github.com/tosslab/web_client/compare/v1.31.0...v1.31.1) (2016-06-10)


### Bug Fixes

* **message:** context 오류 수정 ([8887188](https://github.com/tosslab/web_client/commit/8887188))
* **message:** 메시지 소켓 데이터 순서가 보장되어 오지 않을 경우, 해당 메시지 data에 접근하지 못하는 현상 수정 ([fd619e7](https://github.com/tosslab/web_client/commit/fd619e7))
* **new-message:** new message  버튼 위치 잘못 찾는 현상 수정 ([8c457cf](https://github.com/tosslab/web_client/commit/8c457cf))



<a name="1.31.0"></a>
# [1.31.0](https://github.com/tosslab/web_client/compare/v1.30.1...v1.31.0) (2016-06-09)


### Bug Fixes

* **connect:** connect enable/disable 상태 변경이 실시간으로 토픽 헤더에 반영되지 않는 버그 수정 ([6e9a62f](https://github.com/tosslab/web_client/commit/6e9a62f))

### Features

* **bubbleview:** message 텝에서 검색 결과의 아이템 선택시 center의 message가 highlight되는 효과 변경 ([2b0e62d](https://github.com/tosslab/web_client/commit/2b0e62d))



<a name="1.30.1"></a>
## [1.30.1](https://github.com/tosslab/web_client/compare/v1.30.0...v1.30.1) (2016-06-07)


### Bug Fixes

* **bubbleview:** 텍스트 복사시 unread count와 write time이 포함되지 않도록 수정 ([6d36a00](https://github.com/tosslab/web_client/commit/6d36a00))
* **center:** scroll 아래로 내려갔을 때 marker API 호출 시 참조 오류 수정 ([9515327](https://github.com/tosslab/web_client/commit/9515327))
* **center:** 내가 보낸 메시지가 잔존하는 현상 수정 ([3c21968](https://github.com/tosslab/web_client/commit/3c21968))
* **center:** 여러 파일에 공유된 파일에 멘션을 걸어 comment 를 달 경우, 중복 파싱되어 태그가 노출되는 현상 수정 ([d160101](https://github.com/tosslab/web_client/commit/d160101))
* **center:** 토픽 초대 system message 에서 xxx "님이" 에서 "님이" 가 출력되지 않는 현상 수정 ([b5450a7](https://github.com/tosslab/web_client/commit/b5450a7))
* **connect:**  봇 프로필 변경되지 않는 현상 수정 ([3b9ca67](https://github.com/tosslab/web_client/commit/3b9ca67))
* **connect:** 커넥트 항목 추가 시 추가 메시지 노출되지 않는 현상 수정 ([156a88d](https://github.com/tosslab/web_client/commit/156a88d))
* **left:** 새 메시지 버튼 위치 잘못잡는 현상 수정 ([732dfd4](https://github.com/tosslab/web_client/commit/732dfd4))
* **mention:** 멘션 리스트 갱신되지 않는 버그 수정 & 키입력시 active index 초기화 되는 버그수정 ([e6450f4](https://github.com/tosslab/web_client/commit/e6450f4))
* **postMessage:** window.postMessage 로 들어오는 데이터 중 데이터가 undefined 일 경우 예외 처리 추가 ([fdeb49d](https://github.com/tosslab/web_client/commit/fdeb49d))
* **profile:** 프로필 모달에서 1:1 메시지 클릭시 1:1 메시지로 이동되지 않는 현상 수정 ([d72213e](https://github.com/tosslab/web_client/commit/d72213e))



<a name="1.30.0"></a>
# [1.30.0](https://github.com/tosslab/web_client/compare/v1.29.0...v1.30.0) (2016-06-04)


### Bug Fixes

* **bubbleview:** @all 멘션 텍스트에 스타일 적용 안되는 버그 수정 ([8851d74](https://github.com/tosslab/web_client/commit/8851d74))
* **collection:** core collection 의 update  버그 수정 ([6b150cd](https://github.com/tosslab/web_client/commit/6b150cd))
* **message.delete:** fix error with message delete event ([c55faa8](https://github.com/tosslab/web_client/commit/c55faa8))
* **notification:** 웹훅 메시지에 대해 노티 배너 출력되지 않는 현상 수정 ([f6b1483](https://github.com/tosslab/web_client/commit/f6b1483))
* **notification:** 윈도우 기본 사운드 off ([37282d4](https://github.com/tosslab/web_client/commit/37282d4))
* **teamswitch:** 팀선택 드롭다운에서 팀 선택하지 않고 Enter 입력 시 백화 현상 수정 ([d1429e5](https://github.com/tosslab/web_client/commit/d1429e5))

### Features

* **connect:** scroll 위치에 따라 커넥트 상단 navigation 노출하는 기능 추가 ([be99da6](https://github.com/tosslab/web_client/commit/be99da6))
* **jump:** tracker 추가 ([dd79d8b](https://github.com/tosslab/web_client/commit/dd79d8b))



<a name="1.29.0"></a>
# [1.29.0](https://github.com/tosslab/web_client/compare/v1.28.2...v1.29.0) (2016-05-31)


### Bug Fixes

* **file-detail:** 파일 상세가 활성화 된 상태에서 다른 파일 url 로 접근 시 우측 패널 갱신되지 않는 현상 수정 ([5c0b1f9](https://github.com/tosslab/web_client/commit/5c0b1f9)), closes [#2](https://github.com/tosslab/web_client/issues/2)
* **filecard:** 센터 파일 카드에 공유자가 아닌 파일 업로더를 표현하도록 수정 ([7d6557f](https://github.com/tosslab/web_client/commit/7d6557f))
* **mention:** 댓글에 작성된 mention 선택시 dm 으로 이동하도록 수정 ([3074b97](https://github.com/tosslab/web_client/commit/3074b97))
* **mention-tab:** 멘션이 있는 댓글에 대해 멘션탭에서 소켓 이벤트 수신 ([5708563](https://github.com/tosslab/web_client/commit/5708563)), closes [#2](https://github.com/tosslab/web_client/issues/2)
* **mobile:** 모바일 사파리에서 접근 시 대응 ([4accc12](https://github.com/tosslab/web_client/commit/4accc12))
* **modal:** 초대가 취소된 Dummy Member 를 차단된 멤버 리스트에 표시하지 않음 ([b486b75](https://github.com/tosslab/web_client/commit/b486b75))
* **net:** Linux 를 위해 timeout threshold 값 증가 ([e81dea2](https://github.com/tosslab/web_client/commit/e81dea2))
* **net:** Linux 를 위해 timeout 추가 ([17270a3](https://github.com/tosslab/web_client/commit/17270a3))
* **net:** Linux 를 위해 timeout 추가 ([7ab94dd](https://github.com/tosslab/web_client/commit/7ab94dd))
* **pdf:** 파일 상세에서 pdf의 l10n 수정 & image card와 view 통일 ([b37b6f6](https://github.com/tosslab/web_client/commit/b37b6f6))
* **pdf-viewer:** PDF 뷰어 레이아웃 오류 수정 ([46c2f03](https://github.com/tosslab/web_client/commit/46c2f03))
* **pdf-viewer:** 링크일 경우 새창으로 열도록 수정 ([95f43e2](https://github.com/tosslab/web_client/commit/95f43e2))
* **socket:** 타인이 토픽에 멤버 초대 시 멤버 목록 갱신되지 않는 현상 수정 ([6a5e5c6](https://github.com/tosslab/web_client/commit/6a5e5c6))
* **topicjoin:** 토픽 리스트 출력에서 참여한 토픽이 private일때 아이콘 다릴 표시하도록 수정 ([23fc1f9](https://github.com/tosslab/web_client/commit/23fc1f9))

### Features

* **center:** input 필드에 keyboard focus가 있어도 특정 시간 동안 움직임이 없는 경우 inactive 상태 처리하도록 수정 ([89ad473](https://github.com/tosslab/web_client/commit/89ad473))
* **center:** 토픽 멤버 목록에 검색창 추가 ([4ead756](https://github.com/tosslab/web_client/commit/4ead756))
* **center:** 토픽 멤버 목록에서 자기 자신이 최상단에 오도록 함 ([906d941](https://github.com/tosslab/web_client/commit/906d941))
* **custom-selectbox:** 대화방 선택에서 1:1 메시지의 멤버 배열 순서 알파벳 순으로 조정 ([4a5edac](https://github.com/tosslab/web_client/commit/4a5edac))
* **network:** 네트워크 끊긴 상태와 소켓 끊긴 상태 구분 ([a761a28](https://github.com/tosslab/web_client/commit/a761a28))
* **sticker:** Dingo 스티커 추가 ([3611129](https://github.com/tosslab/web_client/commit/3611129))
* **sticker:** 새로운 스티커 표시인 N 에 transition 효과 추가 ([da250b8](https://github.com/tosslab/web_client/commit/da250b8))
* **sticker:** 스티커에 마우스 오른쪽 버튼 클릭했을때 이미지 속성으로 context menu 표현하지 않도록함 ([7eda797](https://github.com/tosslab/web_client/commit/7eda797))



<a name="1.28.2"></a>
## [1.28.2](https://github.com/tosslab/web_client/compare/v1.28.1...v1.28.2) (2016-05-26)




<a name="1.28.1"></a>
## [1.28.1](https://github.com/tosslab/web_client/compare/v1.28.0...v1.28.1) (2016-05-26)




<a name="1.28.0"></a>
# [1.28.0](https://github.com/tosslab/web_client/compare/v1.27.2...v1.28.0) (2016-05-18)


### Bug Fixes

* **center:** 최초로 파일 공유 받을 때, 파일 공유해제된 것 처럼 보여짐 + layout 깨짐 현상 해결 ([ad3ea6d](https://github.com/tosslab/web_client/commit/ad3ea6d))
* **leftwidth:** localstorage에 왼쪽 패널의 너비값이 존재하지 않을때 기본값 사용하도록 수정 ([44538ed](https://github.com/tosslab/web_client/commit/44538ed))
* **markdown:** 마크다운 정책 수정 ([626bf81](https://github.com/tosslab/web_client/commit/626bf81))
* **mixpanel:** remove mixpanel related file ([2eb6570](https://github.com/tosslab/web_client/commit/2eb6570))
* **room:** 토픽 참여시, 좌측 패널에 즉시 표시되지 않는 현상 해결 ([e28e983](https://github.com/tosslab/web_client/commit/e28e983))

### Features

* **left:** left panel 리사이즈 가능하도록 추가 ([b8f7a99](https://github.com/tosslab/web_client/commit/b8f7a99))



<a name="1.27.2"></a>
## [1.27.2](https://github.com/tosslab/web_client/compare/v1.27.1...v1.27.2) (2016-05-11)




<a name="1.27.1"></a>
## [1.27.1](https://github.com/tosslab/web_client/compare/v1.27.0...v1.27.1) (2016-05-11)




<a name="1.27.0"></a>
# [1.27.0](https://github.com/tosslab/web_client/compare/v1.26.1...v1.27.0) (2016-05-11)


### Bug Fixes

* **ctrlKey:** ctrl -> cmd ([d9f01ec](https://github.com/tosslab/web_client/commit/d9f01ec))
* **files:** DM에 파일 공유시 파일 리스트가 갱신되지 않는 버그 수정 ([4ad8cec](https://github.com/tosslab/web_client/commit/4ad8cec))
* **memberProfile:** member profile 변경된 정보고 왼쪽 상단에 바로 반영되지 않는 버그 수정 ([623d43f](https://github.com/tosslab/web_client/commit/623d43f))
* **mentionbutton:** 1:1메시지 일경우 멘션 버튼 활성화 되지 않도록 수정 ([9e06a17](https://github.com/tosslab/web_client/commit/9e06a17))
* **right:** 로딩 request 수행 조건 수정 ([df17d6a](https://github.com/tosslab/web_client/commit/df17d6a))
* **wrongurl:** channel과 file detail의 id 값으로 잘못된 값 전달시 오동작 하지 않도록 수정 ([5f71787](https://github.com/tosslab/web_client/commit/5f71787))

### Features

* **memberfilter:** 프로필 필드별 멤버 검색 ([d81fba0](https://github.com/tosslab/web_client/commit/d81fba0))
* **teamSwitch:** 키보드 네비게이션 ([3a8c75c](https://github.com/tosslab/web_client/commit/3a8c75c))
* **topicInvite:** 토픽 초대 모달에서 모든 멤버 선택하기가 검색결과 리스트를 기준으로 동작하도록 수정 ([80adfa0](https://github.com/tosslab/web_client/commit/80adfa0))



<a name="1.26.1"></a>
## [1.26.1](https://github.com/tosslab/web_client/compare/v1.26.0...v1.26.1) (2016-05-04)




<a name="1.26.0"></a>
# [1.26.0](https://github.com/tosslab/web_client/compare/v1.25.2...v1.26.0) (2016-05-04)


### Features

* **pdf-viewer:** pdf-viewer 추가 ([a7e0535](https://github.com/tosslab/web_client/commit/a7e0535))



<a name="1.25.2"></a>
## [1.25.2](https://github.com/tosslab/web_client/compare/v1.25.1...v1.25.2) (2016-05-02)


### Bug Fixes

* **ESM:** 방금 생성한 1인 토픽에서 멤버 초대 유도 ESM 표시되지 않는 현상 수정 ([900f2e1](https://github.com/tosslab/web_client/commit/900f2e1))
* **invite:** 토픽 초대 시 참조 오류로 인해 toast alarm 노출되지 않는 현상 수정 ([94fb501](https://github.com/tosslab/web_client/commit/94fb501))



<a name="1.25.1"></a>
## [1.25.1](https://github.com/tosslab/web_client/compare/v1.25.0...v1.25.1) (2016-05-02)


### Bug Fixes

* **ctrlKey:** ctrl -> cmd ([2ed6664](https://github.com/tosslab/web_client/commit/2ed6664))



<a name="1.25.0"></a>
# [1.25.0](https://github.com/tosslab/web_client/compare/v1.24.1...v1.25.0) (2016-04-28)


### Bug Fixes

* **DM:** DM 에서 삭제된 메시지의 뱃지 카운트 감소되지 않음 현상 수정 ([924de85](https://github.com/tosslab/web_client/commit/924de85))
* **badge:** DM 일 경우 unread count 가 0 일 때 update badge value 를 수행하지 않는 현상 수정 ([dc43f20](https://github.com/tosslab/web_client/commit/dc43f20))
* **badge:** new message 버튼 인식 오류 수정 ([3d6cf40](https://github.com/tosslab/web_client/commit/3d6cf40))
* **css:** opac-zero 에 important 제거 ([6d4a83a](https://github.com/tosslab/web_client/commit/6d4a83a))
* **css:** opac-zero 에 important 제거 ([150d1fe](https://github.com/tosslab/web_client/commit/150d1fe))
* **css:** 더미 어카운트 inactive 멤버 대화창 상단 툴팁 스타일 수정. ([c8bc889](https://github.com/tosslab/web_client/commit/c8bc889))
* **css:** 윈도우 클라이언트에서 하얀화면에서 멈추는 현상 수정 ([59db4c3](https://github.com/tosslab/web_client/commit/59db4c3))
* **css): client.app.center.view_components.entity_header.view:** inactive멤버 대화창 팝오버의 스타일 일부 수정. ([47f91b0](https://github.com/tosslab/web_client/commit/47f91b0))
* **entity:** entity 의 type 정보가 복수인지 여부를 검출하는 로직의 버그 수정 ([738aa11](https://github.com/tosslab/web_client/commit/738aa11))
* **entity:** 윈도우 클라이언트에서 하얀화면에서 멈추는 현상 수정 ([9da27ad](https://github.com/tosslab/web_client/commit/9da27ad))
* **entity:** 호환성을 위해 entity 의 type 을 소문자 복수로 변경하는 부분 버그 수정 ([af981d1](https://github.com/tosslab/web_client/commit/af981d1))
* **error:** app이 sleep 상태중 gateway-timeout 에러 발생시 app이 하얗게 표현되는 버그 수정 ([78b962b](https://github.com/tosslab/web_client/commit/78b962b))
* **folder:** 멤버 초대, 토픽 생성 시 > 폴더의 뱃지카운트 깜박이는 현상 수정 ([6e0b86e](https://github.com/tosslab/web_client/commit/6e0b86e))
* **integration:** 구글 드라이브 파일 업로드시 구글 계정 연동후 바로 파일 picker 출력하도록 수정 ([a302f46](https://github.com/tosslab/web_client/commit/a302f46))
* **intercom:** 'web_landing'과 'web_client'에 있는 intercom이 개별 intercom으로 동작하도록 수정 ([fb5b1b5](https://github.com/tosslab/web_client/commit/fb5b1b5))
* **marker:** Dummy member 에게 보낸 메시지의 unread count 가 2로 표시되는 현상 수정 ([42d2c76](https://github.com/tosslab/web_client/commit/42d2c76))
* **mobile:** android 앱 실행 url 변경 ([9435a35](https://github.com/tosslab/web_client/commit/9435a35))
* **right tab:** star 패널 접근시 403 에러 발생하는 버그 수정 ([66c63ad](https://github.com/tosslab/web_client/commit/66c63ad))
* **socket:** member update 에 대한 이벤트 핸들러 수정 ([9c6e805](https://github.com/tosslab/web_client/commit/9c6e805))
* **socket:** topic_invited 이벤트 핸들러 오류 수정 ([709e725](https://github.com/tosslab/web_client/commit/709e725))
* **socket:** 초대 거절 취소로 삭제된 Dummy Member 가 리스트에 표시 됨 현상 수정 ([96a658f](https://github.com/tosslab/web_client/commit/96a658f))

### Features

* **dummy-account:** DM 에서 inactive user 의 entity header 변경 적용 ([6b9e464](https://github.com/tosslab/web_client/commit/6b9e464))
* **dummy-account:** inactive member 프로필 추가 ([989ad50](https://github.com/tosslab/web_client/commit/989ad50)), closes [#4](https://github.com/tosslab/web_client/issues/4)
* **dummy-account:** member list 영역에 초대 매일 재전송 추가 ([4326261](https://github.com/tosslab/web_client/commit/4326261)), closes [#3](https://github.com/tosslab/web_client/issues/3)
* **intercom:** intercom 추가 ([e204445](https://github.com/tosslab/web_client/commit/e204445))
* **jump:** jump modal에 animation 및 dim 제거 ([9807101](https://github.com/tosslab/web_client/commit/9807101))
* **pdf-viewer:** pdf-viewer 추가 ([83d9184](https://github.com/tosslab/web_client/commit/83d9184))



<a name="1.24.1"></a>
## [1.24.1](https://github.com/tosslab/web_client/compare/v1.24.0...v1.24.1) (2016-04-22)


### Bug Fixes

* **markdown:** $&, $`, $' 문자열이 들어갔을 경우, 무한 루프에 빠지는 현상 수정 ([bb2f908](https://github.com/tosslab/web_client/commit/bb2f908))



<a name="1.24.0"></a>
# [1.24.0](https://github.com/tosslab/web_client/compare/v1.23.2...v1.24.0) (2016-04-20)


### Bug Fixes

* **dropdown-selectbox:** value 값 실시간으로 변경되지 않는 현상 수정 ([c92d4a2](https://github.com/tosslab/web_client/commit/c92d4a2))

### Features

* **setting:** E-mail notification 설정 옵션 추가 ([4c2c470](https://github.com/tosslab/web_client/commit/4c2c470))
* **setting:** email notification 매 시간으로 설정 시 시간 선택 옵션 표시하지 않음 ([a207d5e](https://github.com/tosslab/web_client/commit/a207d5e))
* **setting:** 알림 설정을 껐다 켰을 때 테스트 메시지 버튼이 잘림 현상 수정 ([f1f7964](https://github.com/tosslab/web_client/commit/f1f7964))



<a name="1.23.2"></a>
## [1.23.2](https://github.com/tosslab/web_client/compare/v1.23.1...v1.23.2) (2016-04-15)


### Bug Fixes

* **alertUnknownError:** 504 gateway 오류일 경우 -1 alert 노출되는 현상 보강 ([ac6b1f5](https://github.com/tosslab/web_client/commit/ac6b1f5))



<a name="1.23.1"></a>
## [1.23.1](https://github.com/tosslab/web_client/compare/v1.23.0...v1.23.1) (2016-04-14)


### Bug Fixes

* **marker:** 타 플랫폼에서 자기 자신이 보낸 메시지에 대해서는 unread 카운트 증가시키지 않도록 수정 ([9636b4c](https://github.com/tosslab/web_client/commit/9636b4c))
* **marker:** 타 플랫폼에서 자기 자신이 보낸 메시지에 대해서는 unread 카운트 증가시키지 않도록 수정 ([d9d232d](https://github.com/tosslab/web_client/commit/d9d232d))



<a name="1.23.0"></a>
# [1.23.0](https://github.com/tosslab/web_client/compare/v1.22.0...v1.23.0) (2016-04-14)


### Bug Fixes

* **Mac-App:** 일렉트론 App 으로 unread count 간혹 정상적으로 전달하지 못하는 현상 수정 ([ba0e180](https://github.com/tosslab/web_client/commit/ba0e180))
* **alertUnknownError:** 401 오류 시 alert 노출하지 않도록 수정 ([5a3c99b](https://github.com/tosslab/web_client/commit/5a3c99b))
* **alertUnknownError:** 504 Gateway Timeout 일 경우에 alert 띄우지 않도록 수정 ([2807c27](https://github.com/tosslab/web_client/commit/2807c27))
* **center:** inactive 상태일 때도 unreadMarker 가 업데이트 되는 현상 수정 ([9f99a63](https://github.com/tosslab/web_client/commit/9f99a63))
* **center:** 메시지 전송시 두 번 노출되는 현상 수정 ([f442413](https://github.com/tosslab/web_client/commit/f442413))
* **center:** 전송중을 표시하는 dummy text 에서 실제 text 로 변경될 때 자연스러운 전환을 위해 dummy text 를 제거하는 시점 변경 ([ebeebaa](https://github.com/tosslab/web_client/commit/ebeebaa))
* **center:** 전송중을 표시하는 dummy text 에서 실제 text 로 변경될 때 자연스러운 전환을 위해 dummy text 를 제거하는 시점 변경 ([19fe613](https://github.com/tosslab/web_client/commit/19fe613))
* **favicon:** 모든 메시지를 읽었는데도 안읽은 상태를 표시하는 favicon 이 나타나는 현상 수정 ([53f9abc](https://github.com/tosslab/web_client/commit/53f9abc))
* **file:** 댓글 잇는 파일을 연속으로 업로드시, 두 번재 파일의 댓글이 입력되지 않음 ([8791c44](https://github.com/tosslab/web_client/commit/8791c44))
* **profile:** 프로필 이미지 변경 실패시 alert dialog 출력하도록 수정 ([518946f](https://github.com/tosslab/web_client/commit/518946f))
* **초기진입:** 앱 진입시 로직 개선 (API 이상 패턴 호출건) ([b5fa056](https://github.com/tosslab/web_client/commit/b5fa056))

### Features

* **stickers:** 스티커 사용기록이 없으면 최신탭 대신, Day&Emily 스티커 탭을 표시함 ([4dd5664](https://github.com/tosslab/web_client/commit/4dd5664))
* **top-header:** top 메뉴 영역의 메뉴 드롭다운 선택 시 메뉴버튼 포커스 유지 하도록 수정 ([aa91aa8](https://github.com/tosslab/web_client/commit/aa91aa8))



<a name="1.22.0"></a>
# [1.22.0](https://github.com/tosslab/web_client/compare/v1.21.2...v1.22.0) (2016-04-06)


### Bug Fixes

* **build:** font-awesome v4.2.0 으로 변경 ([c6cde66](https://github.com/tosslab/web_client/commit/c6cde66))
* **build:** jandi-icon.svg path error fixed ([46a0685](https://github.com/tosslab/web_client/commit/46a0685))
* **grunt:** fontawesome 404 error fix ([3eecec6](https://github.com/tosslab/web_client/commit/3eecec6))
* **tutorial:** 툴팁 사라지지 않는 현상 해결 ([5e6c5a7](https://github.com/tosslab/web_client/commit/5e6c5a7))

### Features

* **active:** Web Client 업데이트 방식 / Active 발송 방식 개선 ([a7ae05f](https://github.com/tosslab/web_client/commit/a7ae05f))



<a name="1.21.2"></a>
## [1.21.2](https://github.com/tosslab/web_client/compare/v1.21.1...v1.21.2) (2016-03-30)




<a name="1.21.1"></a>
## [1.21.1](https://github.com/tosslab/web_client/compare/v1.21.0...v1.21.1) (2016-03-30)


### Bug Fixes

* **connect:** connect 가 연결될 방을 변경하더라도 변경되지 않는 현상 수정 ([f2bfa9d](https://github.com/tosslab/web_client/commit/f2bfa9d))



<a name="1.21.0"></a>
# [1.21.0](https://github.com/tosslab/web_client/compare/v1.20.1...v1.21.0) (2016-03-30)


### Bug Fixes

* **DM:** 파일 업로드 후 토픽 재진입 새로고침 시 파일 공유 해제된 것으로 표시되는 현상 수정 ([04b2164](https://github.com/tosslab/web_client/commit/04b2164))
* **bot:** Mr.J 에서 파일이 공유 해제된 것으로 표시되는 현상 수정 ([9e059ea](https://github.com/tosslab/web_client/commit/9e059ea))
* **center:** Center 패널에서 메시지 삭제가 즉시 반영되지 않는 현상 수정 ([ed1dc37](https://github.com/tosslab/web_client/commit/ed1dc37))
* **connect:** Mr. J 에 커넥트 설정할 수 없는 현상 수정 ([f0ec1af](https://github.com/tosslab/web_client/commit/f0ec1af))
* **css:** modal footer & dialog modal button container 의 스타일 추가 (inline-block요소의 불필요한 공간 제 ([decc382](https://github.com/tosslab/web_client/commit/decc382))
* **css:** 모달 내 cancel 버튼에 공통 마진값 추가. ([9b3fae5](https://github.com/tosslab/web_client/commit/9b3fae5))
* **css:** 팀 초대 모달의 초대하기 버튼이 비활성화 상태일때 hover 효과가 적용되지 않도록 수정. ([53a9c85](https://github.com/tosslab/web_client/commit/53a9c85))
* **dialog:** admin 코드와 동기화 ([0749967](https://github.com/tosslab/web_client/commit/0749967))
* **header:** 헤더의 dropdown menu가 body의 자식으로 출력되도록 수정 ([19d55c5](https://github.com/tosslab/web_client/commit/19d55c5))
* **html:** 멤버 초대하기 모달의 초대버튼에 pull-right 클래스 추가 ([b2c2e80](https://github.com/tosslab/web_client/commit/b2c2e80))
* **html:** 파일 업로드 버튼에 pull-right 클래스 추가 & 순서 변경 ([cdbe049](https://github.com/tosslab/web_client/commit/cdbe049))
* **right:** shared in All 로 설정될 경우, 오류 발생하는 현상 수정 ([17d62b4](https://github.com/tosslab/web_client/commit/17d62b4))
* **socket:** reconnection 최대 5분으로 변경 ([43c4d7e](https://github.com/tosslab/web_client/commit/43c4d7e))
* **socket:** 웹소켓만 동작하도록 수정 ([3527440](https://github.com/tosslab/web_client/commit/3527440))
* **topicInvite:** 초대하려고 추가된 멤버가 모달 리스트에 잔존함 ([9df614a](https://github.com/tosslab/web_client/commit/9df614a))
* **파일공유:** Mr.J 에 파일 공유한 후, '파일이 공유된 토픽으로 이동하기' 시, 기본 토픽으로 Redirection 됨 해결 ([ea6bbda](https://github.com/tosslab/web_client/commit/ea6bbda))

### Features

* **avatar:** 프로필 이미지 변경 방식 개선 ([ef8b110](https://github.com/tosslab/web_client/commit/ef8b110))
* **right:** 파일 업로드 ESM 버튼 제거 및 클릭시 동작 제거 ([06386f4](https://github.com/tosslab/web_client/commit/06386f4))
* **teamInvite:** 초대 버튼 활성화되는 시점 변경 ([34e1a96](https://github.com/tosslab/web_client/commit/34e1a96))



<a name="1.20.1"></a>
## [1.20.1](https://github.com/tosslab/web_client/compare/v1.20.0...v1.20.1) (2016-03-25)


### Bug Fixes

* **socket:** reconnection 최대 5분으로 변경 ([260dfc2](https://github.com/tosslab/web_client/commit/260dfc2))
* **socket:** 웹소켓만 동작하도록 수정 ([8410eed](https://github.com/tosslab/web_client/commit/8410eed))



<a name="1.20.0"></a>
# [1.20.0](https://github.com/tosslab/web_client/compare/v1.19.0...v1.20.0) (2016-03-23)


### Bug Fixes

* **auth:** refresh token 으로 갱신 시도 시 오류 발생하여 진입이 멈추는 현상 수정 ([67821a0](https://github.com/tosslab/web_client/commit/67821a0))
* **center:** 메시지 두번 나타나는 증상 다시 처리 ([980e389](https://github.com/tosslab/web_client/commit/980e389))
* **center:** 메시지 두번 나타나는 증상 다시 처리 ([028bc04](https://github.com/tosslab/web_client/commit/028bc04))
* **css:** 튜토리얼 v3의 팝오버, 툴팁이 커넥트 화면 위로 올라오는 이슈 수정. ([dd13160](https://github.com/tosslab/web_client/commit/dd13160))
* **jump:** 점포 모달에서 키보드 액션 에러 수정 ([d38e304](https://github.com/tosslab/web_client/commit/d38e304))
* **mention:** 업로드 모달에서 멘션 form에 연속 입력이 가능하도록 빈 칸이 생성되지 않는 버그 수정 ([ea4b3b9](https://github.com/tosslab/web_client/commit/ea4b3b9))
* **socket:** 토픽 참여시 system message 가 즉시 표시되지 않는 현상 해결 ([3ac8732](https://github.com/tosslab/web_client/commit/3ac8732))
* **stringEscape:** escape 문자열이 바로 보이는 버그 수정 ([d4a3639](https://github.com/tosslab/web_client/commit/d4a3639))
* **튜토리얼:** 영문 congratulations 에 username 노출하도록 수정 ([efceac5](https://github.com/tosslab/web_client/commit/efceac5))

### Features

* **profileImage:** 프로필 모달에 사용되는 이미지 사이즈 80px -> 360px로 변경 ([5d6313f](https://github.com/tosslab/web_client/commit/5d6313f))
* **teamSwitch:** 팀 전환 드롭다운 개선 & 기존 모달 대체 ([4a00932](https://github.com/tosslab/web_client/commit/4a00932))
* **topicAdmin:** 토픽 관리자 지정하기 ([f34ca03](https://github.com/tosslab/web_client/commit/f34ca03))



<a name="1.19.0"></a>
# [1.19.0](https://github.com/tosslab/web_client/compare/v1.18.0...v1.19.0) (2016-03-16)


### Bug Fixes

* **center:** 메시지 전송 시 해당 메시지가 두 번 노출되는 현상 수정 ([eb9fa62](https://github.com/tosslab/web_client/commit/eb9fa62))
* **fileUpload:** 새로 생성한 토픽에 3rd party의 파일 업로드시, 이전 토픽에 파일 업로드 되는 버그 수정 ([7c357b5](https://github.com/tosslab/web_client/commit/7c357b5))
* **joined:** 토픽에 사용자가 참여하였을때 비동기 응답으로 인한 버그 수정 & 토픽 참여시 마다 레프트 사이드 API 호출하지 않도록 수정 ([fc7ab94](https://github.com/tosslab/web_client/commit/fc7ab94))
* **left:** 토픽 참여시 left panel 갱신되지 않는 현상 해결 ([7553a08](https://github.com/tosslab/web_client/commit/7553a08))
* **socket:** socket invite 이벤트 발생 시 private topic 에 대한 정보를 가져오지 못하는 현상 수정 ([e1d6713](https://github.com/tosslab/web_client/commit/e1d6713))
* **socket:** 토픽 참여시 system message 가 즉시 표시되지 않는 현상 해결 ([84987ae](https://github.com/tosslab/web_client/commit/84987ae))
* **unread-marker:** unread marker 동작 오류 수정 ([b739161](https://github.com/tosslab/web_client/commit/b739161))
* **커스텀셀렉트박스:** 메시지 검색의 작성자 필터 검색어 입력 시 connect bot 이 노출되는 오류 수정 ([a63a90a](https://github.com/tosslab/web_client/commit/a63a90a))

### Features

* **filter:** 사용자가 입력한 문자열을 통해 필터링된 리스트가 출력되는 순서 개선 ([62e6a79](https://github.com/tosslab/web_client/commit/62e6a79))
* **sticker:** 스티커 선택시 기본탭을 최근사용 탭으로 변경 ([879dfe6](https://github.com/tosslab/web_client/commit/879dfe6))
* **커스텀셀렉트박스:** 검색에서 검색어와 가장 먼저 매치 된 목록 순서로 조정 ([6a44198](https://github.com/tosslab/web_client/commit/6a44198))



<a name="1.18.0"></a>
# [1.18.0](https://github.com/tosslab/web_client/compare/v1.17.4...v1.18.0) (2016-03-09)




<a name="1.17.4"></a>
## [1.17.4](https://github.com/tosslab/web_client/compare/v1.17.3...v1.17.4) (2016-03-09)


### Bug Fixes

* **css:** center 영역 최소너비 & 파일 star 버튼 위치 & 파일카드 너비 수정. ([e2f0e9a](https://github.com/tosslab/web_client/commit/e2f0e9a))
* **css:** 공지사항 최소화 상태일 때 더보기 버튼과 본문이 겹치는 이슈 수정. ([ed9f05f](https://github.com/tosslab/web_client/commit/ed9f05f))
* **css:** 시스템 메시지 스타일 수정. ([8f58e50](https://github.com/tosslab/web_client/commit/8f58e50))
* **css:** 파일카드 바깥으로 file name 빠져나오는 이슈 수정 (IE 대응) ([394fd1f](https://github.com/tosslab/web_client/commit/394fd1f))
* **topicMember:** 토픽에 참여한 멤버명을 내림차순으로 정렬하여 출력하도록 수정 ([46ccc54](https://github.com/tosslab/web_client/commit/46ccc54))

### Features

* **GC:** GC 설정 추가시 기본값 변경 ([10fe685](https://github.com/tosslab/web_client/commit/10fe685))
* **uploadComment:** 업로드 시 코멘트 입력 제한 풀기 & 텍스트 컨테이너 개선 ([43e21e6](https://github.com/tosslab/web_client/commit/43e21e6))
* **공지사항:** 디자인 개선 사항 l10n 적용 ([0aaac9c](https://github.com/tosslab/web_client/commit/0aaac9c))



<a name="1.17.3"></a>
## [1.17.3](https://github.com/tosslab/web_client/compare/v1.17.2...v1.17.3) (2016-03-03)


### Bug Fixes

* **connect:** connect-preview 에 마크다운 깨지는 현상 해결 ([ab5d634](https://github.com/tosslab/web_client/commit/ab5d634))



<a name="1.17.2"></a>
## [1.17.2](https://github.com/tosslab/web_client/compare/v1.17.1...v1.17.2) (2016-03-03)


### Bug Fixes

* **preload:** preload 완료 시 preload 된 image element 제거하는 로직 제거 ([7dec194](https://github.com/tosslab/web_client/commit/7dec194))



<a name="1.17.1"></a>
## [1.17.1](https://github.com/tosslab/web_client/compare/v1.17.0...v1.17.1) (2016-03-03)


### Bug Fixes

* **center:** input box 의 upload 동작 불가 현상 수정 ([2d5bd26](https://github.com/tosslab/web_client/commit/2d5bd26))
* **center:** message 가 archive 일 때 badge count 업데이트 하지 않도록 수정 ([9fbbe8c](https://github.com/tosslab/web_client/commit/9fbbe8c))
* **html:** remove comma ([204ea7b](https://github.com/tosslab/web_client/commit/204ea7b))
* **scroll:** 파일 클릭하여 우측 패널 열릴때 스크롤 올라가는 버그 수정 ([fa12402](https://github.com/tosslab/web_client/commit/fa12402))
* **socket:** 자신의 댓글에 대해 뱃지 카운트 증가하는 오류 및 unread marker 오류 수정 ([e2d4a1c](https://github.com/tosslab/web_client/commit/e2d4a1c))
* **tutorial:** build 시 이미지 rev가 되지 않는 현상 수정 ([0426a89](https://github.com/tosslab/web_client/commit/0426a89))
* **tutorial:** 상단 배너 노출 상태에 따라 tooltip 위치 조정하도록 수정 ([4d07aaf](https://github.com/tosslab/web_client/commit/4d07aaf))
* **tutorial:** 튜토리얼 z-index 조정 ([29272c5](https://github.com/tosslab/web_client/commit/29272c5))
* **xxs:** 링크 프리뷰와 커넥트 프리뷰에 입력되는 테그 제거하도록 추가 ([e6d0344](https://github.com/tosslab/web_client/commit/e6d0344))
* **튜토리얼:** content 에도 username 치환 구문 추가 ([dc8dba8](https://github.com/tosslab/web_client/commit/dc8dba8))
* **튜토리얼:** pcapp 조건 수정 ([84f94c2](https://github.com/tosslab/web_client/commit/84f94c2))
* **튜토리얼:** 영문 congratulations 에 username 노출하도록 수정 ([0b9415a](https://github.com/tosslab/web_client/commit/0b9415a))
* **튜토리얼:** 웰컴 모달에 fade 효과 추가 ([e9c6d59](https://github.com/tosslab/web_client/commit/e9c6d59))
* **튜토리얼:** 윈도우 앱의 경우 이미지 스냅샷 리소르를 사용하도록 수정 ([eebd069](https://github.com/tosslab/web_client/commit/eebd069))
* **튜토리얼:** 튜토리얼 ? 드롭다운 메뉴의 dot indicator 위치 어긋남 수정 ([2bd4149](https://github.com/tosslab/web_client/commit/2bd4149))
* **튜토리얼:** 튜토리얼 ? 메뉴에 dot indicator 추가 ([03c3526](https://github.com/tosslab/web_client/commit/03c3526))

### Features

* **dialog:** 비공개 토픽 나가기 confirm 에서 html tag 허용하도록 수정 ([558b7b8](https://github.com/tosslab/web_client/commit/558b7b8))
* **link:** 메시지 링크 생성시 IPv4도 링크 생성 규칙에 추가 ([bf230a8](https://github.com/tosslab/web_client/commit/bf230a8))
* **mention:** 토픽 멤버가 0명일때 '@all'시 Dialog 출력하지 않도록 수정 ([c004884](https://github.com/tosslab/web_client/commit/c004884))
* **튜토리얼:** 비디오 preload 추가 ([0f94b63](https://github.com/tosslab/web_client/commit/0f94b63))
* **튜토리얼v3:** step1 웰컴 모달 기본 스타일 및 동작 완료 ([adba232](https://github.com/tosslab/web_client/commit/adba232))
* **튜토리얼v3:** step2 툴팁 완료 ([b8b0321](https://github.com/tosslab/web_client/commit/b8b0321))
* **튜토리얼v3:** step2, 3 동작 완료 ([6898a0e](https://github.com/tosslab/web_client/commit/6898a0e))



<a name="1.17.0"></a>
# [1.17.0](https://github.com/tosslab/web_client/compare/v1.16.0...v1.17.0) (2016-03-02)


### Bug Fixes

* **connect:** 커넥트 웹훅 설정 방법 안내 레이아웃 깨지는 현상 수정 ([263d0bf](https://github.com/tosslab/web_client/commit/263d0bf))
* **css:** 마크다운 안내 텍스트 위치, 마진 수정. ([5d887cf](https://github.com/tosslab/web_client/commit/5d887cf))
* **css:** 메시지 전송버튼 아웃라인 삭제. ([bf901e9](https://github.com/tosslab/web_client/commit/bf901e9))
* **css:** 봇메시지, mr. j일 때 프로필이미지 보더 삭제. ([fc180f7](https://github.com/tosslab/web_client/commit/fc180f7))
* **dialog:** 언어설정 영문일 때, 파일 삭제시 br태그 삽입돼있음 ([1f227fa](https://github.com/tosslab/web_client/commit/1f227fa))
* **integration:** 설정 저장 버튼 회색을 파란색으로 변경 ([f604f7c](https://github.com/tosslab/web_client/commit/f604f7c))
* **left:** topic folder 조회 API 요청 전 이전에 요청하던 request 가 존재할 경우 cancel 하는 로직 추가 ([ffab1a6](https://github.com/tosslab/web_client/commit/ffab1a6))
* **markdown:** 동일 멘션이 여러개 존재할 경우 잘못된 위치에 링크를 생성하는 현상 해결 ([4d2a4b9](https://github.com/tosslab/web_client/commit/4d2a4b9))
* **team:** 가입한 팀이 1개 팀일 경우 전환 아이콘 노출하지 않음 ([1e21ef4](https://github.com/tosslab/web_client/commit/1e21ef4))

### Features

* **incoming-webhook:**  설정 예제에 실제 webhook url 이 노출되도록 변경 ([a64b515](https://github.com/tosslab/web_client/commit/a64b515))



<a name="1.16.0"></a>
# [1.16.0](https://github.com/tosslab/web_client/compare/v1.15.0...v1.16.0) (2016-02-24)


### Bug Fixes

* **DM:** IO 에서 메시지 전송시 화면 갱신함. ([2bc3453](https://github.com/tosslab/web_client/commit/2bc3453))
* **auth:** 401 오류 시 로딩 화면 지속되는 현상 다시 수정 ([c219e62](https://github.com/tosslab/web_client/commit/c219e62))
* **auth:** access_token 이 만료된 시점에 url hash 값 붙이지 않고 진입한 경우 로딩 화면에서 멈추는 현상 해결 ([218ebdc](https://github.com/tosslab/web_client/commit/218ebdc))
* **auth:** access_token 이 만료된 시점에 url hash 값 붙이지 않고 진입한 경우 로딩 화면에서 멈추는 현상 해결 ([fd44404](https://github.com/tosslab/web_client/commit/fd44404))
* **auth:** refresh token 으로 갱신 시도 시 오류 발생하여 진입이 멈추는 현상 수정 ([5cfc099](https://github.com/tosslab/web_client/commit/5cfc099))
* **center:** unread marker 오류 및 파일 업로드 시 최신 메시지로 이동되지 않는 현상 수정 ([64106fc](https://github.com/tosslab/web_client/commit/64106fc))
* **center:** 검색으로 아주 오래전 메시지로 이동 후 본인이 파일 업로드 시 가장 최신 메시지로 이동하지 않던 오류 수정 ([42dfd5f](https://github.com/tosslab/web_client/commit/42dfd5f))
* **file-upload:** 잔디 Drag&Drop화면 유지되는 오류 수정 ([094b694](https://github.com/tosslab/web_client/commit/094b694))
* **left:** topic folder 조회 API 요청 전 이전에 요청하던 request 가 존재할 경우 cancel 하는 로직 추가 ([825c69e](https://github.com/tosslab/web_client/commit/825c69e))
* **loading:** 오른쪽 패널에 즐겨찾기와 멘션에서 리스트 로딩시 로딩바 추가 ([f257a35](https://github.com/tosslab/web_client/commit/f257a35))
* **marker:** member 초대 후 입력된 메시지의 unread count 가 토픽 재 진입 시 사라지는 현상 수정 ([7b87d16](https://github.com/tosslab/web_client/commit/7b87d16))
* **mention:** 사용자가 입력한 메세지에서 올바른 mention data를 전달하지 않는 버그 수정 ([dd1ff36](https://github.com/tosslab/web_client/commit/dd1ff36))
* **star:** 센터 > 파일 > 더보기를 통한 즐겨찾기 동작안하는 버그 수정 ([6d6db20](https://github.com/tosslab/web_client/commit/6d6db20))
* **tab:** mentions & stars 로딩휠 style 수정 ([c94ca83](https://github.com/tosslab/web_client/commit/c94ca83))
* **tab:** mentions & stars 로딩휠 style 수정 ([b102549](https://github.com/tosslab/web_client/commit/b102549))
* **공지사항:** 공지사항 최소화 되지 않는 현상 수정 ([9b3fcea](https://github.com/tosslab/web_client/commit/9b3fcea))



<a name="1.15.0"></a>
# [1.15.0](https://github.com/tosslab/web_client/compare/v1.14.1...v1.15.0) (2016-02-17)


### Bug Fixes

* **DM:**  최초 DM의 메시지 삭제 시 로딩휠 지속되는 현상 수정 ([ee866b3](https://github.com/tosslab/web_client/commit/ee866b3))
* **connect:** Mr. J 에 Incoming Webhook connect 연동 시 Invalid room error 발생 하는 현상 해결 ([0056dc5](https://github.com/tosslab/web_client/commit/0056dc5))
* **file:** 삭제된 파일에 등록된 댓글을 삭제할 수 있도록 변경 ([0a70bf8](https://github.com/tosslab/web_client/commit/0a70bf8))
* **hotkey:** cmd + e 입력 시 center panel 에서만 스티커 토글 되도록 수정 ([a303fe0](https://github.com/tosslab/web_client/commit/a303fe0))
* **mention:** center가 DM일때 우측 패널 진입시 멘션동작 하지 않는 버그 수정 ([68ad9da](https://github.com/tosslab/web_client/commit/68ad9da))
* **notification:** 파이어폭스에서 알림 설정 오픈시 잔상남는 버그 수정 ([67fc668](https://github.com/tosslab/web_client/commit/67fc668))
* **star:** star tab이 간헐적으로 아무것도 출력하지 않는 버그 수정 ([9f7ca19](https://github.com/tosslab/web_client/commit/9f7ca19))
* **star:** 즐겨찾기 뷰에서,DM의 starred item의 위치가 상대방을 출력하도록 수정 ([14fc2ab](https://github.com/tosslab/web_client/commit/14fc2ab))



<a name="1.14.1"></a>
## [1.14.1](https://github.com/tosslab/web_client/compare/v1.14.0...v1.14.1) (2016-02-11)




<a name="1.14.0"></a>
# [1.14.0](https://github.com/tosslab/web_client/compare/v1.13.2...v1.14.0) (2016-02-11)


### Bug Fixes

* **hotkey:** 토픽 URL 로 진입시, 로딩 휠 지속 표시됨 현상 해결 ([02212eb](https://github.com/tosslab/web_client/commit/02212eb))
* **marker:** 팀 관리자 표시와 즐겨찾기 요소가 겹처 표시 되지 않도록 수정 ([695548e](https://github.com/tosslab/web_client/commit/695548e))



<a name="1.13.2"></a>
## [1.13.2](https://github.com/tosslab/web_client/compare/v1.13.1...v1.13.2) (2016-02-01)


### Bug Fixes

* **bot:** 잔디봇 DM일때 헤더에 잔디봇 아이콘 출력되지 않는 버그 수정 ([56311fb](https://github.com/tosslab/web_client/commit/56311fb))
* **bot:** 잔디봇에 "여기까지 읽었습니다" 표현되지 않는 버그 수정 ([5f4610c](https://github.com/tosslab/web_client/commit/5f4610c))



<a name="1.13.1"></a>
## [1.13.1](https://github.com/tosslab/web_client/compare/v1.13.0...v1.13.1) (2016-01-28)




<a name="1.13.0"></a>
# [1.13.0](https://github.com/tosslab/web_client/compare/v1.12.9...v1.13.0) (2016-01-28)




<a name="1.12.9"></a>
## [1.12.9](https://github.com/tosslab/web_client/compare/v1.12.8...v1.12.9) (2016-01-27)


### Bug Fixes

* **center:** 비공개 토픽에서 메시지에 "공지로 등록" 메뉴 노출되지 않는 현상 수정 ([97ea304](https://github.com/tosslab/web_client/commit/97ea304))
* **잔디connect:** backend 이슈 해결하기 전까지 계정 추가하기 버튼 disable 처리 ([a194221](https://github.com/tosslab/web_client/commit/a194221))
* **잔디connect:** 계정 추가 메뉴를 통해 계정 추가했을 경우 account list 를 갱신하는 로직에서도 소켓 이벤트를 통해 갱신할 수 있도록 추가 ([0d326f3](https://github.com/tosslab/web_client/commit/0d326f3))



<a name="1.12.8"></a>
## [1.12.8](https://github.com/tosslab/web_client/compare/v1.12.7...v1.12.8) (2016-01-27)


### Bug Fixes

* **css:** jump modal 내 border color 및 shadow 추가. ([7131e61](https://github.com/tosslab/web_client/commit/7131e61))
* **css:** left 패널에서 badge의 padding 값이 잘못 보여지던 문제 수정. ([612f3de](https://github.com/tosslab/web_client/commit/612f3de))
* **css:** 봇 메시지 attachment 영역 패딩 값 수정. ([5544628](https://github.com/tosslab/web_client/commit/5544628))
* **css:** 좌측 패널 언리드 배지 z-index 수정. (레프트 패널 헤더보다 올라오도록) ([c132300](https://github.com/tosslab/web_client/commit/c132300))
* **custom-selectbox:** connect bot 은 리스트에 나오지 않도록 수정 ([04a6e52](https://github.com/tosslab/web_client/commit/04a6e52))
* **custom-selectbox:** 멤버 custom selectbox 에 Mr.J 노출하도록 수정 ([95cc1d8](https://github.com/tosslab/web_client/commit/95cc1d8))
* **custom-selectbox:** 잔디 bot이 존재하지 않을 경우 예외처리 추가 ([e5669df](https://github.com/tosslab/web_client/commit/e5669df))
* **custom-selectbox:** 커스텀 셀렉트 박스의 '공유된 곳' 필터에 자신의 이름이 표시되는 현상 수정 ([fee3967](https://github.com/tosslab/web_client/commit/fee3967))
* **custom-selectbox:** 특수 문자 검색 가능하도록 수정 ([4e3ea10](https://github.com/tosslab/web_client/commit/4e3ea10))
* **html:** 잔디 connect 웹훅 인스트럭션 내용 수정. ([f6168d5](https://github.com/tosslab/web_client/commit/f6168d5))
* **main:** 로딩 화면에서 freeze 되는 현상 수정 ([c86cab0](https://github.com/tosslab/web_client/commit/c86cab0))
* **markdown:** 복수의 멘션과 링크 마크다운이 이어질 때, 멘션이 적용되지 않음 현상 수정 ([3c1796f](https://github.com/tosslab/web_client/commit/3c1796f))
* **markdown:** 커넥트 최초 설정( 연동항목 추가로 진입 ) 시, 설정 사항 조정한 부분이 없더라도 화면을 나가려고 시도할 경우 해당 CONFIRM 출력 ([dbe8a22](https://github.com/tosslab/web_client/commit/dbe8a22))
* **preload:** preload 범위에 html 파일 추가 ([0bcad51](https://github.com/tosslab/web_client/commit/0bcad51))
* **preloader:** 저사항 컴퓨터에서 preload 로 인해 느려지는 현상 수정 ([837722f](https://github.com/tosslab/web_client/commit/837722f))
* **socket:** authentication_created 이벤트를 team 이벤트로 간주하도록 수정 ([85a66ad](https://github.com/tosslab/web_client/commit/85a66ad))
* **잔디connect:** MR. J 에 connect 추가 시 오류 수정 ([0226c43](https://github.com/tosslab/web_client/commit/0226c43))
* **잔디connect:** Revoke 이후 50001 오류 노출 시 confirm 창에 노출할 serviceName 이 undefined 로 노출되는 현상 수정 ([fdb19bb](https://github.com/tosslab/web_client/commit/fdb19bb))
* **잔디connect:** selectbox 에서 잔디 bot 선택시 entityId 를 반환하도록 수정 ([09369ee](https://github.com/tosslab/web_client/commit/09369ee))
* **잔디connect:** 변경 사항 검출 로직 오류 수정 ([356bf16](https://github.com/tosslab/web_client/commit/356bf16))
* **잔디connect:** 본인이 만든 connect일 경우에만 source 노출하도록 수정 ([6c6cd79](https://github.com/tosslab/web_client/commit/6c6cd79))
* **잔디connect:** 삭제 버튼 클릭 이후 잘못된 변수 참조하는 오류 수정 ([7f896cb](https://github.com/tosslab/web_client/commit/7f896cb))
* **잔디connect:** 설정 상세 페이지에서 변경사항 없을 경우 CONFIRM 출력하지 않기 ([636e090](https://github.com/tosslab/web_client/commit/636e090))
* **잔디connect:** 설정 화면 진입 시 권한 없음 (403) 오류 코드에 대한 처리 ([40a89c3](https://github.com/tosslab/web_client/commit/40a89c3))
* **잔디connect:** 연동 해제시 메시지 l10n 기준으로 변경 ([6023d5f](https://github.com/tosslab/web_client/commit/6023d5f))
* **잔디connect:** 잔디 커넥트 닫기 버튼 클릭 시 confirm 모달 노출되지 않는 현상 수정 ([4326764](https://github.com/tosslab/web_client/commit/4326764))
* **잔디connect:** 튜토리얼 popover 노출 조건에 video 가 로드 완료 되었는지 여부 판단하도록 추가 ([9d8bcf7](https://github.com/tosslab/web_client/commit/9d8bcf7))
* **잔디connect:** 트렐로 bot 프로필 변경사항 저장되지 않는 현상 수정 ([429cee8](https://github.com/tosslab/web_client/commit/429cee8))



<a name="1.12.7"></a>
## [1.12.7](https://github.com/tosslab/web_client/compare/v1.12.6...v1.12.7) (2016-01-18)


### Bug Fixes

* **center:** deprecated 된 message/update API 제거했던 내용 다시 사용하도록 롤백 ([3b24c3c](https://github.com/tosslab/web_client/commit/3b24c3c))
* **client.app.connect:** connect  설정 페이지 읽기 전용 인풋필드 라인하이트 수정. ([9efe3ca](https://github.com/tosslab/web_client/commit/9efe3ca))
* **client.app.connect:** connect 설정 페이지 셀렉트 버튼 아이콘에 브라우저별 트랜지션 코드 추가. ([117780e](https://github.com/tosslab/web_client/commit/117780e))
* **css:** bot message style 수정. ([882569c](https://github.com/tosslab/web_client/commit/882569c))
* **css:** entity header내 토픽명 최대 너비 미디어쿼리 삭제. ([1405104](https://github.com/tosslab/web_client/commit/1405104))
* **css:** 잔디 connect 설정 페이지 / entity header 내 connect 관련 스타일 수정. ([ab0b545](https://github.com/tosslab/web_client/commit/ab0b545))
* **html:** 인커밍 웹훅 curl 메시지 수정. ([96eb92d](https://github.com/tosslab/web_client/commit/96eb92d))
* **markdown:** 링크 마크다운 뒤에 바로 문자가 올 경우 제대로 파싱되지 않는 현상 수정 ([addd849](https://github.com/tosslab/web_client/commit/addd849))
* **markdown:** 링크 마크다운 로직 보강 ([2667232](https://github.com/tosslab/web_client/commit/2667232))
* **markdown:** 링크 마크다운 로직 보강 ([6d037ba](https://github.com/tosslab/web_client/commit/6d037ba))
* **markdown:** 링크 마크다운 로직 보강 ([44ab1e5](https://github.com/tosslab/web_client/commit/44ab1e5))
* **markdown:** 링크 마크다운 로직 보강 ([e8eec20](https://github.com/tosslab/web_client/commit/e8eec20))
* **style:**  bot 메시지 스타일 수정 (패딩, 컬러, 위치) ([966513f](https://github.com/tosslab/web_client/commit/966513f))
* **style:** bot 메시지 레이블 추가 ([58e8328](https://github.com/tosslab/web_client/commit/58e8328))
* **style:** 날짜 divider 스타일 / 커넥터 봇 메시지 / 봇 메시지 프로필 이미지 스타일 수정. ([0f9176b](https://github.com/tosslab/web_client/commit/0f9176b))
* **style:** 날짜 divider 스타일 수정. ([dcc7af2](https://github.com/tosslab/web_client/commit/dcc7af2))
* **style:** 봇메시지 헤더 , 프로필 스타일 수정. ([1336aff](https://github.com/tosslab/web_client/commit/1336aff))
* **언어설정:** 언어설정 노출되지 않는 현상 수정 ([d26f604](https://github.com/tosslab/web_client/commit/d26f604))
* **잔디connect:** Jandi bot 이 없을 경우 예외처리 추가 ([72ffe3c](https://github.com/tosslab/web_client/commit/72ffe3c))



<a name="1.12.6"></a>
## [1.12.6](https://github.com/tosslab/web_client/compare/v1.12.5...v1.12.6) (2016-01-13)




<a name="1.12.5"></a>
## [1.12.5](https://github.com/tosslab/web_client/compare/v1.12.4...v1.12.5) (2016-01-13)


### Bug Fixes

* **center:** 잔여 버그 수정 ([e58cce7](https://github.com/tosslab/web_client/commit/e58cce7))
* **markdown:** bold 일 경우 마크다운 파싱 오류 현상 수정 ([5283b71](https://github.com/tosslab/web_client/commit/5283b71))
* **markdown:** mention 한개만 나오는 버그 수정 ([e6b5a8b](https://github.com/tosslab/web_client/commit/e6b5a8b))
* **잔디 connect:** ESC 입력시 close 애니메이션 동작하지 않는 현상 수정 외 1건 ([86a84e0](https://github.com/tosslab/web_client/commit/86a84e0))
* **잔디 connect:** ESC 입력시 close 애니메이션 동작하지 않는 현상 수정 외 1건 ([9b96eeb](https://github.com/tosslab/web_client/commit/9b96eeb))
* **잔디 connect:** 설정 저장하기 L10N 추가 ([5b805f9](https://github.com/tosslab/web_client/commit/5b805f9))
* **잔디connect:**  각 연동 서비스마다 100개 항목 이상 설정 시도 시 에러 메시지 발생 ([a9c07a8](https://github.com/tosslab/web_client/commit/a9c07a8))
* **잔디connect:** integration 계정 연동 해지시, 실행 중인 Integration 이 없을 때 메시지 분기처리 ([b7d52be](https://github.com/tosslab/web_client/commit/b7d52be))
* **잔디connect:** webhook 설정에서 언어 설정 표시하지 않음 ([d1866e3](https://github.com/tosslab/web_client/commit/d1866e3))
* **잔디connect:** 기획과 협의하여 브라우저 back 버튼 클릭 시 기본동작 방해하는 코드 제거 ([e3dee3b](https://github.com/tosslab/web_client/commit/e3dee3b))
* **잔디connect:** 마크다운 파서 "anchormarker" 표시됨 현상 수정 ([932d76c](https://github.com/tosslab/web_client/commit/932d76c))



<a name="1.12.4"></a>
## [1.12.4](https://github.com/tosslab/web_client/compare/v1.12.3...v1.12.4) (2016-01-12)




<a name="1.12.3"></a>
## [1.12.3](https://github.com/tosslab/web_client/compare/v1.12.2...v1.12.3) (2016-01-12)


### Bug Fixes

* **client.app. connect.union.common.selectbox.menu:** 멀티 계정일때 계정추가 상단에 디바이더 추가. ([6d9b68a](https://github.com/tosslab/web_client/commit/6d9b68a))
* **client.app.center:** bot 텍스트 메시지 스타일 수정. ([79e2d76](https://github.com/tosslab/web_client/commit/79e2d76))
* **client.app.center.view_components.entity_header:** 센터 패널 토픽 타이틀 최대 너비 수정. ([683b0f2](https://github.com/tosslab/web_client/commit/683b0f2))
* **client.app.connect:** connect 계정 이름 최대 너비 추가. ([8b122e6](https://github.com/tosslab/web_client/commit/8b122e6))
* **client.app.connect:** connect 새 토픽 생성 버 언어별 최대 너비 수정(en) ([eb5cbf4](https://github.com/tosslab/web_client/commit/eb5cbf4))
* **client.app.connect:** connect 서베이 버튼 최대너비, 설정페이지 버튼 레이블 미디어쿼리 삭제. ([c5a48c2](https://github.com/tosslab/web_client/commit/c5a48c2))
* **client.app.connect:** connect 설정 페이지 언어별 최대 너비 수정(en) ([2ec0ba1](https://github.com/tosslab/web_client/commit/2ec0ba1))
* **client.app.connect:** connect 설정 페이지 언어별 최대 너비 수정. ([cccafd5](https://github.com/tosslab/web_client/commit/cccafd5))
* **client.app.connect:** connect 언어별 최대 너비 수정(en / ja) ([25406a5](https://github.com/tosslab/web_client/commit/25406a5))
* **client.app.connect:** connect 인증 페이지 디폴트 아이콘 수정. ([77c0c40](https://github.com/tosslab/web_client/commit/77c0c40))
* **client.app.connect:** connect 인증 페이지 스타일 & 마크업 수정 ([ffc59df](https://github.com/tosslab/web_client/commit/ffc59df))
* **client.app.connect.union.google-calendar:** 구글 캘린더 설정 페이지 체크박스 컨테이너에 클래스 추가. ([9fc50bb](https://github.com/tosslab/web_client/commit/9fc50bb))
* **connect:** 잔디 connect 토픽헤더 , 아이콘 관련 스타일 수정 ([0987170](https://github.com/tosslab/web_client/commit/0987170))
* **css & image:** 로딩휠 관련 내용 롤 ([f010d3d](https://github.com/tosslab/web_client/commit/f010d3d))
* **custom-selectbox:** disabled item 추가 ([afbb33e](https://github.com/tosslab/web_client/commit/afbb33e))
* **custom-selectbox:** filter 에서 걸러진 item 도 선택되는 현상 수정 ([446e53f](https://github.com/tosslab/web_client/commit/446e53f))
* **custom-selectbox:** 이름 노출 부분에 safeApply 추가 ([72cef14](https://github.com/tosslab/web_client/commit/72cef14))
* **custom-selectbox:** 커스텀 셀렉트박스 default select 오류 수정 ([e7ea3a5](https://github.com/tosslab/web_client/commit/e7ea3a5))
* **file-detail:** src --> ng-src 로 변경 ([6c69190](https://github.com/tosslab/web_client/commit/6c69190))
* **interceptor:** 401 오류의 경우 reject 를 수행하지 않도록 처리 ([6caf3e3](https://github.com/tosslab/web_client/commit/6caf3e3))
* **markdown:** link parser 에서 [링크](<http://domain.com>) 지원되지 않는 오류 수정 ([c1f258b](https://github.com/tosslab/web_client/commit/c1f258b))
* **markdown:** ~가 *와 혼합되어 있을 때 제대로 파싱 안되는 현상 수정 ([f5645bc](https://github.com/tosslab/web_client/commit/f5645bc))
* **markdown:** 띄어쓰기 구분하는 로직 제거 및 _ 마크다운 제거 ([bc43bca](https://github.com/tosslab/web_client/commit/bc43bca))
* **markdown:** 마크다운 파서 규칙 통일 ([2d893c8](https://github.com/tosslab/web_client/commit/2d893c8))
* **markdown:** 마크다운 파서 규칙 통일 ([6e04801](https://github.com/tosslab/web_client/commit/6e04801))
* **module:** Popup 에서 get parameter 를 encode 하지 않는 버그 수정 ([79eab7b](https://github.com/tosslab/web_client/commit/79eab7b))
* **popup:** popup service 에서 location replace 시 data 에 해당하는 정보를 가져오지 못하는 오류 수정 ([8e539b8](https://github.com/tosslab/web_client/commit/8e539b8))
* **router:** build 할 경우 router 정상동작 하지 않는 오류 수정 ([2c3505a](https://github.com/tosslab/web_client/commit/2c3505a))
* **잔디connect:** DM 리스트 에 integration bot이 표시됨. ([46ee2e5](https://github.com/tosslab/web_client/commit/46ee2e5))
* **잔디connect:** auth 화면에서 서비스 하단 설명 박스 주석처리 ([e64e8e9](https://github.com/tosslab/web_client/commit/e64e8e9))
* **잔디connect:** room 공통  selectbox 에서 디폴트로 현재 토픽을 노출하도록 수정 ([eb553f1](https://github.com/tosslab/web_client/commit/eb553f1))
* **잔디connect:** selected item 이 존재하지 않을 경우 잘못된 default item 을 설정하는 현상 수정 ([aeaf267](https://github.com/tosslab/web_client/commit/aeaf267))
* **잔디connect:** validation 및 default 설정값 오류 수정 ([d2677ca](https://github.com/tosslab/web_client/commit/d2677ca))
* **잔디connect:** 스타일 수정 ([742afc3](https://github.com/tosslab/web_client/commit/742afc3))
* **잔디connect:** 커넥트 뒤로가기 방식 개선 ([7a178f8](https://github.com/tosslab/web_client/commit/7a178f8))
* **잔디connect:** 커넥트 뒤로가기 방식 개선 ([980da64](https://github.com/tosslab/web_client/commit/980da64))
* **잔디connect:** 토스트 메시지 자동으로 사라지도록 수정 ([e6662c1](https://github.com/tosslab/web_client/commit/e6662c1))
* **잔디connect-Github:** 접근할 수 없는 repository 추가 ([c7b8d75](https://github.com/tosslab/web_client/commit/c7b8d75))



<a name="1.12.2"></a>
## [1.12.2](https://github.com/tosslab/web_client/compare/v1.12.1...v1.12.2) (2015-12-24)




<a name="1.12.1"></a>
## [1.12.1](https://github.com/tosslab/web_client/compare/v1.12.0...v1.12.1) (2015-12-23)


### Bug Fixes

* **default-topic-id:** 서버로부터 전송받은 defaultTopicId 가 존재하지 않는 entity 일 경우(데이터 오류) 자신이 가입한 토픽 Map 중 가장 첫번째  ([fd8479d](https://github.com/tosslab/web_client/commit/fd8479d))



<a name="1.12.0"></a>
# [1.12.0](https://github.com/tosslab/web_client/compare/v1.11.0...v1.12.0) (2015-12-16)


### Bug Fixes

* **app:** 한글일 경우 font-familyd에 돋움 추가 ([47f4912](https://github.com/tosslab/web_client/commit/47f4912))
* **app:** 한글일 경우 영문 font-family 2개 추가 ([a533f10](https://github.com/tosslab/web_client/commit/a533f10))
* **app.notification:** _loadLocalNotificationFlag 의 기본값을 true 로 설정하도록 수정 ([aa3a6e2](https://github.com/tosslab/web_client/commit/aa3a6e2))
* **app.notification:** app 일 경우 notification 설정 값 저장되지 않는 현상 해결 ([da8d695](https://github.com/tosslab/web_client/commit/da8d695))
* **app.notification:** 앱의 경우 내용 보여주기 관련된 값에 대해서도 재설정 하는 로직 추가 ([42b6f27](https://github.com/tosslab/web_client/commit/42b6f27))
* **center:** center에 출력되는 thumbnail size를 medium -> large ([d449eb3](https://github.com/tosslab/web_client/commit/d449eb3))
* **center:** 댓글 뷰도 메세지 뷰와 마찬가지로 작성자 합치기 적용하도록 수정 ([fddffd2](https://github.com/tosslab/web_client/commit/fddffd2))
* **center:** 원본이미지 보기를 제공하는 file만 "이미지 보기"버튼 출력 하도록 수정 ([ea11ed0](https://github.com/tosslab/web_client/commit/ea11ed0))
* **center:** 코멘트 타이틀에 표현 되는 코멘트의 총 수가 잘못 표시되는 버그 수정 ([c2353dc](https://github.com/tosslab/web_client/commit/c2353dc))
* **center:** 파일 뷰 버그 수정 ([ab9cee1](https://github.com/tosslab/web_client/commit/ab9cee1))
* **center:** 파일 뷰 버그 수정 ([a1a3dad](https://github.com/tosslab/web_client/commit/a1a3dad))
* **dropdown:** 드롭다운 오버랩 되는 현상 수정 ([35bce9d](https://github.com/tosslab/web_client/commit/35bce9d))
* **lang:** request후 reponse data가 lang 값 설정값과 sync 되지 않는 버그 수정 ([bbc2629](https://github.com/tosslab/web_client/commit/bbc2629))
* **left:** 토픽명 길 때 툴팁 없어짐 현상 수정 ([fa00420](https://github.com/tosslab/web_client/commit/fa00420))
* **modal:** 로그아웃 > 로그인 > 프로필 모달 출력 후 닫히지 않는 버그 수정 ([62617cb](https://github.com/tosslab/web_client/commit/62617cb))
* **modal:** 백드랍 사라지지 않는 현상에 대한 방어코드 추가 ([47d49ce](https://github.com/tosslab/web_client/commit/47d49ce))
* **modal:** 점프 모달에서 뱃지카운트가 있는 DM이 최상단에 노출 되도록 수정 ([0549ff7](https://github.com/tosslab/web_client/commit/0549ff7))
* **noti:** 노티 유지시간 10초에서 7초로 변경 ([b92fdb0](https://github.com/tosslab/web_client/commit/b92fdb0))
* **right:** server의 버전이 올라가있고 client의 버전이 낮은 경우 client에서 한번도 이미지 요청 하지 않았다가 최초 요청시 네임이 변경된 이 ([aa9b814](https://github.com/tosslab/web_client/commit/aa9b814))
* **right:** 코멘트 입력란에 프로필 동작하지 않는 버그 수정 ([1f19bbf](https://github.com/tosslab/web_client/commit/1f19bbf))
* **right:** 파일탭 진입 상태로 토픽 이동시 검색 필터 변경되지 않는 현상 수정 ([f0a788d](https://github.com/tosslab/web_client/commit/f0a788d))
* **right:** 필터타입 이미지 프리뷰 클릭시 원본 이미지 보도록 수정 ([20a0a52](https://github.com/tosslab/web_client/commit/20a0a52))
* **shortcut:** shortcut 모달 reference 오류 수정 ([cd3162b](https://github.com/tosslab/web_client/commit/cd3162b))
* **shortcut:** 단축키 안내 메뉴에 불필요한 테스트용 text 제거 ([f82625f](https://github.com/tosslab/web_client/commit/f82625f))
* **src:** src 를 ng-src 로 변경함 ([baa1e14](https://github.com/tosslab/web_client/commit/baa1e14))
* **sticker:** 메세지 입력시 sticker 예외처리 ([867cddc](https://github.com/tosslab/web_client/commit/867cddc))
* **sticker:** 선택된 sticker와 입력된 sticker의 사이즈 126px로 수정 ([d69355c](https://github.com/tosslab/web_client/commit/d69355c))
* **sticker:** 스티커 아이콘의 z-index 삭제 & 스티커 입력시 블링크 현상 수정 ([d5c2d82](https://github.com/tosslab/web_client/commit/d5c2d82))
* **version:** 버전정보 노출 로직 수정 ([bd765bb](https://github.com/tosslab/web_client/commit/bd765bb))
* **zoom:** window, mac app 일 경우에만 zoom 기능 동작하도록 수정 ([17fd041](https://github.com/tosslab/web_client/commit/17fd041))
* **zoom:** zoom 이 최대 확대된 이후 특정 값에서 줄어들지 않는 현상 수정 ([8103d0c](https://github.com/tosslab/web_client/commit/8103d0c))
* **zoom:** 가장 처음 로드 시 zoom 레이어 노출되지 않도록 수정 ([a9d9e48](https://github.com/tosslab/web_client/commit/a9d9e48))
* **zoom:** 소숫점 버림하였기 때문에 특정값 이상 올라가거나 내려가지 않는 오류 수정 ([bd7d2a5](https://github.com/tosslab/web_client/commit/bd7d2a5))
* **zoom:** 키패드의 + - 도 인식하도록 수정 ([87f1b50](https://github.com/tosslab/web_client/commit/87f1b50))
* **핫키:** center 혹은 file comment input 인지 여부에 따라 Ctrl + E 입력 시 sticker 노출 위치 변경 ([9826b3e](https://github.com/tosslab/web_client/commit/9826b3e))
* **핫키:** 변경된 키셋 적용 ([c576eae](https://github.com/tosslab/web_client/commit/c576eae))

### Features

* **center:** 코멘트 & 이미지 노출 방식 개선 ([dfc2738](https://github.com/tosslab/web_client/commit/dfc2738))
* **right:** 필터타입 이미지 프리뷰 일때 hover tab 추가 ([b1b4920](https://github.com/tosslab/web_client/commit/b1b4920))
* **sticker:** 대만용 sticker 출력하도록 추가 ([316bc31](https://github.com/tosslab/web_client/commit/316bc31))



<a name="1.11.0"></a>
# [1.11.0](https://github.com/tosslab/web_client/compare/v1.10.0...v1.11.0) (2015-12-02)


### Bug Fixes

* **badge:** DM 에서  Focused 상태에, 메시지 주고 받을 때, Unread badge count 노출되는 현상 수정 ([19ff767](https://github.com/tosslab/web_client/commit/19ff767))
* **badge:** DM 에서  Focused 상태에, 메시지 주고 받을 때, Unread badge count 노출되는 현상 수정 ([2bfd575](https://github.com/tosslab/web_client/commit/2bfd575))
* **badge:** Unfocused 상태의 뱃지카운트가 댓글 등록될때 초기화되는 현상 수정 ([31d4994](https://github.com/tosslab/web_client/commit/31d4994))
* **custom-selectbox:** 커스텀 셀렉트 박스의 '공유된 곳' 필터에 자신의 이름이 표시되는 현상 수정 ([45c728c](https://github.com/tosslab/web_client/commit/45c728c))
* **Custom-Selectbox:** 커스텀 셀랙트 박스에서 차단된 멤버 검색되지 않도록 수정 ([e247380](https://github.com/tosslab/web_client/commit/e247380))
* **Custom-Selectbox:** 커스텀 셀렉트박스에서 차단 멤버 toggle trigger 클릭 시 차단멤버 노출하도록 수정 ([6f9aeb8](https://github.com/tosslab/web_client/commit/6f9aeb8))
* **Custom-Selectbox:** 커스텀 셀렉트박스에서 차단 멤버 toggle trigger 클릭 시 차단멤버 노출하도록 수정 ([071d822](https://github.com/tosslab/web_client/commit/071d822))
* **zoom:** zoom 이 최대 확대된 이후 특정 값에서 줄어들지 않는 현상 수정 ([d18c553](https://github.com/tosslab/web_client/commit/d18c553))
* **파일공유:** 파일을 이미 공유된 토픽에 재공유 할 수 있도록 수정 ([96040c3](https://github.com/tosslab/web_client/commit/96040c3))
* **핫키:** 팀 초대 모달에서 cmd+enter 조건 오류 수정 ([9b49780](https://github.com/tosslab/web_client/commit/9b49780))



<a name="1.10.0"></a>
# [1.10.0](https://github.com/tosslab/web_client/compare/v1.10.0-alpha.19...v1.10.0) (2015-11-25)


### Bug Fixes

* **left:** reconnect 시 update left panel 호출하도록 수정 ([eaec055](https://github.com/tosslab/web_client/commit/eaec055))
* **socket:** member 정보 업데이트하는 socket 이벤트 로직 보강 ([9a01ca3](https://github.com/tosslab/web_client/commit/9a01ca3))



<a name="1.9.3"></a>
## [1.9.3](https://github.com/tosslab/web_client/compare/v1.9.2...v1.9.3) (2015-11-20)




<a name="1.9.2"></a>
## [1.9.2](https://github.com/tosslab/web_client/compare/v1.9.1...v1.9.2) (2015-11-20)




<a name="1.9.1"></a>
## [1.9.1](https://github.com/tosslab/web_client/compare/v1.9.0...v1.9.1) (2015-11-19)




<a name="1.9.3"></a>
## [1.9.3](https://github.com/tosslab/web_client/compare/v1.10.0-alpha.15...v1.9.3) (2015-11-20)




<a name="1.9.2"></a>
## [1.9.2](https://github.com/tosslab/web_client/compare/v1.9.1...v1.9.2) (2015-11-20)




<a name="1.9.1"></a>
## [1.9.1](https://github.com/tosslab/web_client/compare/v1.9.0...v1.9.1) (2015-11-19)




<a name="1.9.2"></a>
## [1.9.2](https://github.com/tosslab/web_client/compare/v1.10.0-alpha.14...v1.9.2) (2015-11-20)




<a name="1.9.1"></a>
## [1.9.1](https://github.com/tosslab/web_client/compare/v1.9.0...v1.9.1) (2015-11-19)




<a name="1.9.1"></a>
## [1.9.1](https://github.com/tosslab/web_client/compare/v1.10.0-alpha.8...v1.9.1) (2015-11-19)




<a name="1.9.0"></a>
# [1.9.0](https://github.com/tosslab/web_client/compare/v1.9.0-alpha.8...v1.9.0) (2015-11-18)


### Bug Fixes

* **center:**  파일 > cog 버튼으로> "댓글남기기" 불가 한 현상 수정 ([2f54f3d](https://github.com/tosslab/web_client/commit/2f54f3d))



<a name="1.8.5"></a>
## [1.8.5](https://github.com/tosslab/web_client/compare/v1.8.4...v1.8.5) (2015-11-18)


### Bug Fixes

* **left-토픽 헤더:** 토픽 헤더에 on over 이벤트 발생 시 뱃지가 존재할 경우 버튼 숨기는 로직 추가 ([a12e350](https://github.com/tosslab/web_client/commit/a12e350))
* **modal:** Dialog modal open시 항상 focus가도록 하는 option 추가 ([382e797](https://github.com/tosslab/web_client/commit/382e797))
* **modal:** modal이 닫혀도 dom element가 사라지지 않는 버그 수정 ([baa4e7d](https://github.com/tosslab/web_client/commit/baa4e7d))
* **right:** right panel 열림과 search entity 변경이 같이 이루어 졌을때 request 두번 하는 버그 수정 ([95c934a](https://github.com/tosslab/web_client/commit/95c934a))
* **sticker:** sticker list 변경이 view에 바로 반영되도록 수정 ([3f07bc7](https://github.com/tosslab/web_client/commit/3f07bc7))
* **sticker:** sticker 조작시 깜빡이는 버그 수정 ([5c52085](https://github.com/tosslab/web_client/commit/5c52085))



<a name="1.8.0-alpha.9"></a>
# [1.8.0-alpha.9](https://github.com/tosslab/web_client/compare/v1.8.0-alpha.8...v1.8.0-alpha.9) (2015-11-11)




<a name="1.8.0-alpha.8"></a>
# [1.8.0-alpha.8](https://github.com/tosslab/web_client/compare/v1.8.0-alpha.7...v1.8.0-alpha.8) (2015-11-11)




<a name="1.8.0-alpha.7"></a>
# [1.8.0-alpha.7](https://github.com/tosslab/web_client/compare/v1.8.0-alpha.6...v1.8.0-alpha.7) (2015-11-11)




<a name="1.8.0-alpha.6"></a>
# [1.8.0-alpha.6](https://github.com/tosslab/web_client/compare/v1.8.0-alpha.5...v1.8.0-alpha.6) (2015-11-11)




<a name="1.8.0-alpha.5"></a>
# [1.8.0-alpha.5](https://github.com/tosslab/web_client/compare/v1.8.0-alpha.4...v1.8.0-alpha.5) (2015-11-11)




<a name="1.8.0-alpha.4"></a>
# [1.8.0-alpha.4](https://github.com/tosslab/web_client/compare/v1.8.0-alpha.2...v1.8.0-alpha.4) (2015-11-11)




<a name="1.8.5"></a>
## [1.8.5](https://github.com/tosslab/web_client/compare/v1.9.0-alpha.7...v1.8.5) (2015-11-18)


### Bug Fixes

* **right:** 파일 상세에서 이미지 클릭했을때 carousel 출력되도록 수정 ([e329ffc](https://github.com/tosslab/web_client/commit/e329ffc))



<a name="1.8.4"></a>
## [1.8.4](https://github.com/tosslab/web_client/compare/v1.8.3...v1.8.4) (2015-11-13)




<a name="1.8.4"></a>
## [1.8.4](https://github.com/tosslab/web_client/compare/v1.8.3...v1.8.4) (2015-11-13)


### Bug Fixes

* **modal:** 팀 초대 모달 링크복사 수정 ([254e2e8](https://github.com/tosslab/web_client/commit/254e2e8))



<a name="1.8.3"></a>
## [1.8.3](https://github.com/tosslab/web_client/compare/v1.8.2...v1.8.3) (2015-11-13)




<a name="1.8.2"></a>
## [1.8.2](https://github.com/tosslab/web_client/compare/v1.9.0-alpha.3...v1.8.2) (2015-11-12)




<a name="1.8.1"></a>
## [1.8.1](https://github.com/tosslab/web_client/compare/v1.9.0-alpha.0...v1.8.1) (2015-11-12)


### Bug Fixes

* **socket:** 파일 공유 시 자신이 2번째 공유한 방에서 center panel 업데이트 되지 않는 현상 수정 ([e0cee03](https://github.com/tosslab/web_client/commit/e0cee03))



<a name="1.9.0-alpha.0"></a>
# [1.9.0-alpha.0](https://github.com/tosslab/web_client/compare/v1.8.1-alpha.0...v1.9.0-alpha.0) (2015-11-11)




<a name="1.8.1-alpha.0"></a>
## [1.8.1-alpha.0](https://github.com/tosslab/web_client/compare/v1.8.0...v1.8.1-alpha.0) (2015-11-11)




<a name="1.8.0"></a>
# [1.8.0](https://github.com/tosslab/web_client/compare/v1.8.0-alpha.11...v1.8.0) (2015-11-11)




<a name="1.7.2"></a>
## [1.7.2](https://github.com/tosslab/web_client/compare/v1.7.1...v1.7.2) (2015-11-05)




<a name="1.7.2"></a>
## [1.7.2](https://github.com/tosslab/web_client/compare/v1.7.1...v1.7.2) (2015-11-05)




<a name="1.7.1"></a>
## [1.7.1](https://github.com/tosslab/web_client/compare/v1.7.0...v1.7.1) (2015-11-05)




<a name="1.7.0"></a>
# [1.7.0](https://github.com/tosslab/web_client/compare/v1.6.3...v1.7.0) (2015-11-04)


### Bug Fixes

* **center:** file message의 최소 높이 설정 & message input란의 box-shadow가 scroll에 영향 미치지 않도록 수정 ([db607c8](https://github.com/tosslab/web_client/commit/db607c8))
* **center:** 스타/ 멘션/ 검색 더블 클릭시 기본 토픽으로 이동하는 현상 해결 ([6bf3651](https://github.com/tosslab/web_client/commit/6bf3651))
* **center:** 코멘트 뷰에서 코멘트 전체가 클릭 가능함 ([b80889d](https://github.com/tosslab/web_client/commit/b80889d))
* **custom.selectbox:** disabled member 가 존재하지 않을 경우 메뉴 자체를  노출하지 않도록 추가 ([f89817d](https://github.com/tosslab/web_client/commit/f89817d))
* **custom.selectbox:** select all 버튼 적용 ([ee18111](https://github.com/tosslab/web_client/commit/ee18111))
* **custom.selectbox:** select all 시 쿼리 누락되는 부분 수정 ([a40f600](https://github.com/tosslab/web_client/commit/a40f600))
* **custom.selectbox:** selectbox  초기 선택 값 없을 시 가장 첫번째 item 을 default 선택하도록 수정 ([28a6b41](https://github.com/tosslab/web_client/commit/28a6b41))
* **custom.selectbox:** selectbox 버그 수정 ([490992c](https://github.com/tosslab/web_client/commit/490992c))
* **custom.selectbox:** 검색조건 초기화 버튼 추가 ([c921684](https://github.com/tosslab/web_client/commit/c921684))
* **custom.selectbox:** 검색조건 초기화 버튼 추가 ([04b7191](https://github.com/tosslab/web_client/commit/04b7191))
* **custom.selectbox:** 검색조건 초기화 툴팁 위치 변경 ([d8f98bd](https://github.com/tosslab/web_client/commit/d8f98bd))
* **kickout:** 강퇴 당했을 때 왼쪽패널 갱신되지 않는 오류 수정 ([4516efa](https://github.com/tosslab/web_client/commit/4516efa))
* **kickout:** 강퇴 모달 주석처리 ([fd9d638](https://github.com/tosslab/web_client/commit/fd9d638))
* **modal:** 토픽 초대 모달에 잘못된 ESM 출력 버그 수정 ([5690612](https://github.com/tosslab/web_client/commit/5690612))
* **right:** topic에 참여중인 member 갱신시 comment에 출력되는 mention list도 갱신되도록 수정 ([9ff898f](https://github.com/tosslab/web_client/commit/9ff898f))
* **right:** 파일 디테일에서 파일텝으로 뒤로 가기시 검색어 리셋되는 버그 수정 ([81ef664](https://github.com/tosslab/web_client/commit/81ef664))
* **tutorial:** jump 버튼 추가 ([4df59a4](https://github.com/tosslab/web_client/commit/4df59a4))
* **tutorial:** 초대 모달 수정 ([67a7f9e](https://github.com/tosslab/web_client/commit/67a7f9e))



<a name="1.6.3"></a>
## [1.6.3](https://github.com/tosslab/web_client/compare/v1.6.2...v1.6.3) (2015-10-30)




<a name="1.6.2"></a>
## [1.6.2](https://github.com/tosslab/web_client/compare/v1.6.1...v1.6.2) (2015-10-29)


### Bug Fixes

* **center:** preview 존재하지 않을때 loading bar 제거하도록 수정 ([35d23a7](https://github.com/tosslab/web_client/commit/35d23a7))



<a name="1.6.1"></a>
## [1.6.1](https://github.com/tosslab/web_client/compare/v1.6.0...v1.6.1) (2015-10-29)




<a name="1.6.0"></a>
# [1.6.0](https://github.com/tosslab/web_client/compare/v1.5.3...v1.6.0) (2015-10-28)


### Bug Fixes

* **app:** 서버에서 예상하지 못한 장애가 발생하여 섬네일을 생성하지 못했을 경우 원본이미지를 불러오도록 수정 ([8c98cbd](https://github.com/tosslab/web_client/commit/8c98cbd))
* **center:** file 공유상태 변경 시 코멘트는 실시간으로 적용되지 않는 현상 해결 ([b128031](https://github.com/tosslab/web_client/commit/b128031))
* **center:** 연동 파일의 경우 파일 사이즈 출력하지 않도록 수정 ([33f5872](https://github.com/tosslab/web_client/commit/33f5872))
* **center:** 파일 공유 해제 시 타 토픽에서 공유 해제했음에도 현재 토픽에 공유 해제로 표시되는 현상 해결 ([885234a](https://github.com/tosslab/web_client/commit/885234a))
* **day:** Fix day in TC. ([5cbf51b](https://github.com/tosslab/web_client/commit/5cbf51b))
* **file.filter:** Fix minor issue with 'fileIcon' filter. ([a52135a](https://github.com/tosslab/web_client/commit/a52135a))
* **file.preview:** Add 'No preview Available' image for files with ai ext. ([84fab39](https://github.com/tosslab/web_client/commit/84fab39))
* **fileIcon:** Add 'image/bmp' to img icon. ([366ba81](https://github.com/tosslab/web_client/commit/366ba81))
* **fileIcon:** Add regular expression for audio and video file. ([a0874bc](https://github.com/tosslab/web_client/commit/a0874bc))
* **fileIcon:** Fix minor issue with file icon ([6a0ae26](https://github.com/tosslab/web_client/commit/6a0ae26))
* **modal:** 자신의 프로필 이미지 설정하는 영역의 크기를 640x640x으로 수정 ([bfaced9](https://github.com/tosslab/web_client/commit/bfaced9))
* **right:** 부정확한 message 또는 file에 대한 접근 메시지 수정 ([df0ae4e](https://github.com/tosslab/web_client/commit/df0ae4e))
* **right:** 삭제된 파일의 comment일 경우 즐겨찾기 아이콘 스타일 버그 수정 ([571a5a2](https://github.com/tosslab/web_client/commit/571a5a2))
* **sticker:** sticker 선택 panel에서 출력되는 리소스 요청을 65px에서 130px 변경. ([2f5ac02](https://github.com/tosslab/web_client/commit/2f5ac02))

### Features

* **center:** 이미지 접기 기능 추가 ([4854ae7](https://github.com/tosslab/web_client/commit/4854ae7))
* **center:** 이미지 접기 기능 추가 ([f7513a8](https://github.com/tosslab/web_client/commit/f7513a8))
* **center:** 이미지 접기 기능 추가 ([136c3a6](https://github.com/tosslab/web_client/commit/136c3a6))
* **inputstorage:** 메시지 입력창과 코멘트 입력창에 입력중이던 text 유지 ([9a642f6](https://github.com/tosslab/web_client/commit/9a642f6))
* **inputstorage:** 메시지 입력창과 코멘트 입력창에 입력중이던 text 유지 ([9066347](https://github.com/tosslab/web_client/commit/9066347))
* **inputstorage:** 메시지 입력창과 코멘트 입력창에 입력중이던 text 유지 ([3c54ddb](https://github.com/tosslab/web_client/commit/3c54ddb))



<a name="1.5.3"></a>
## [1.5.3](https://github.com/tosslab/web_client/compare/v1.5.2...v1.5.3) (2015-10-22)


### Bug Fixes

* **right:** 텝 이동시 검색어 초기화 하도록 수정 ([d4a479e](https://github.com/tosslab/web_client/commit/d4a479e))



<a name="1.5.2"></a>
## [1.5.2](https://github.com/tosslab/web_client/compare/v1.5.1...v1.5.2) (2015-10-22)


### Bug Fixes

* **right:** comment에서 mention목록을 올바르게 가져오지 못하는 버그 수정 ([dc12ffc](https://github.com/tosslab/web_client/commit/dc12ffc))



<a name="1.5.1"></a>
## [1.5.1](https://github.com/tosslab/web_client/compare/v1.5.0...v1.5.1) (2015-10-21)


### Bug Fixes

* **mac:** 이전에 참여하였던 entity의 badge count까지 계산하는 버그 수정 ([5ff656c](https://github.com/tosslab/web_client/commit/5ff656c))
* **mac:** 이전에 참여하였던 entity의 badge count까지 계산하는 버그 수정 ([44a0e5a](https://github.com/tosslab/web_client/commit/44a0e5a))
* **mac:** 이전에 참여하였던 entity의 badge count까지 계산하는 버그 수정 ([e708bc4](https://github.com/tosslab/web_client/commit/e708bc4))



<a name="1.5.0"></a>
# [1.5.0](https://github.com/tosslab/web_client/compare/v1.4.2...v1.5.0) (2015-10-20)


### Bug Fixes

* **auth.controller:** Remove console. ([1ec08da](https://github.com/tosslab/web_client/commit/1ec08da))
* **center:**  loading 휠 사라지지 않는 현상 해결 ([a62ee43](https://github.com/tosslab/web_client/commit/a62ee43))
* **center:**  private 파일 공유 해제 시 view 에 정상적으로 반영되지 않는 오류 수정 ([662a53c](https://github.com/tosslab/web_client/commit/662a53c)), closes [#3207](https://github.com/tosslab/web_client/issues/3207)
* **center:** DM, Unfocused 상태에서 메시지 수신시 badge count에 메시지 개수 +1 되어 표시됨 ([60f6c44](https://github.com/tosslab/web_client/commit/60f6c44))
* **center:** DM에 공유된 파일명이 공유해제된 파일명으로 표시되는 현상 수정 ([553be82](https://github.com/tosslab/web_client/commit/553be82))
* **center:** DM에 공유된 파일명이 공유해제된 파일명으로 표시되는 현상 수정 ([64362fa](https://github.com/tosslab/web_client/commit/64362fa))
* **date:** Add day field to TC and SC ([250d7c4](https://github.com/tosslab/web_client/commit/250d7c4))
* **day:** Add day for TC and SC. ([b73d84c](https://github.com/tosslab/web_client/commit/b73d84c))
* **file.filter:** Remove console.log ([32752f5](https://github.com/tosslab/web_client/commit/32752f5))
* **fileIcon:** Add more mime type cases. ([f0f9118](https://github.com/tosslab/web_client/commit/f0f9118))
* **filterTypePreview:** Add other and hwp filter type preview image. ([5350391](https://github.com/tosslab/web_client/commit/5350391))
* **getFilterTypePreview:** Add 'if' logic for hwp files. ([b44a9be](https://github.com/tosslab/web_client/commit/b44a9be))
* **sign.in:** Redirect to main if disabled member ([988f4e9](https://github.com/tosslab/web_client/commit/988f4e9))

### Features

* **app:** mac application용 badge update api 추가 ([342966f](https://github.com/tosslab/web_client/commit/342966f))
* **app:** mac application용 badge update api 추가 ([066be6a](https://github.com/tosslab/web_client/commit/066be6a))
* **app:** mac app용 badge update trigger 추가 ([dd0803d](https://github.com/tosslab/web_client/commit/dd0803d))
* **center:** file shared/unshared 상태에 따라 실시간으로 view에 반영 ([aa92647](https://github.com/tosslab/web_client/commit/aa92647))
* **center:** file unshare 시 view 변경 - css 수정사항 반영 ([cb9fcdf](https://github.com/tosslab/web_client/commit/cb9fcdf))
* **modal:** quick launcher ([81eb25c](https://github.com/tosslab/web_client/commit/81eb25c))
* **modal:** 파일 업로드 모달의 코멘트에 mention 입력가능 ([8ac2f2b](https://github.com/tosslab/web_client/commit/8ac2f2b))



<a name="1.4.2"></a>
## [1.4.2](https://github.com/tosslab/web_client/compare/v1.4.1...v1.4.2) (2015-10-15)


### Bug Fixes

* **filter.markdown:** markdown parser 버그 수정 ([1caee68](https://github.com/tosslab/web_client/commit/1caee68))



<a name="1.4.1"></a>
## [1.4.1](https://github.com/tosslab/web_client/compare/v1.4.0...v1.4.1) (2015-10-14)


### Bug Fixes

* **markdown:** web link 텍스트에 _ 가 포함될 경우 정상적으로 링크가 형성되지 않는 현상 수정 ([607065b](https://github.com/tosslab/web_client/commit/607065b))
* **markdown:** web link 텍스트에 _ 가 포함될 경우 정상적으로 링크가 형성되지 않는 현상 수정 ([22ee468](https://github.com/tosslab/web_client/commit/22ee468))



<a name="1.4.0"></a>
# [1.4.0](https://github.com/tosslab/web_client/compare/v1.3.4...v1.4.0) (2015-10-14)


### Bug Fixes

* **active-notifier:** 브라우저 unload 시 inactive 상태를 서버로 전송하도록 수정 ([6dab78f](https://github.com/tosslab/web_client/commit/6dab78f))
* **center:** center에 이미지 로딩시 로딩 휠 출력하도록 수정 ([16f7af6](https://github.com/tosslab/web_client/commit/16f7af6))
* **center:** center에 이미지 로딩시 로딩 휠 출력하도록 수정 ([0adacac](https://github.com/tosslab/web_client/commit/0adacac))
* **center:** center에 이미지 로딩시 로딩 휠 출력하도록 수정 ([dd5d510](https://github.com/tosslab/web_client/commit/dd5d510))
* **center:** focus 되어있지 않을 때의 메세지 읽음 표시 오류 수정 ([e5939df](https://github.com/tosslab/web_client/commit/e5939df))
* **center:** folder badge count 접었다 폈을 때 살짝 노출되었다 사라지는 현상 해결 ([a8b342e](https://github.com/tosslab/web_client/commit/a8b342e))
* **center:** markdown code 스타일 오류 수정 ([8978026](https://github.com/tosslab/web_client/commit/8978026))
* **center:** markdown code 스타일 오류 수정 ([200a251](https://github.com/tosslab/web_client/commit/200a251))
* **center:** markdown 중 코드의 변경된 디자인에서 ui 어긋나는 부분 수정 ([46f9433](https://github.com/tosslab/web_client/commit/46f9433))
* **center:** 공지사항에 markdown  적용 ([46313e8](https://github.com/tosslab/web_client/commit/46313e8))
* **center:** 브라우저 포커스 잃었을 때 받은 메세지를 읽지 않고 다른 토픽에 이동 시 읽지 않았음에도 불구하고 read로 표시되는 현상 수정 ([de819b9](https://github.com/tosslab/web_client/commit/de819b9))
* **center:** 브라우저 포커스 잃었을 때 받은 메세지를 읽지 않고 다른 토픽에 이동 시 읽지 않았음에도 불구하고 read로 표시되는 현상 수정 ([110be9c](https://github.com/tosslab/web_client/commit/110be9c))
* **common:** 알 수 없는 결과에 대한 에러 메시지 적용 ([44cdbfd](https://github.com/tosslab/web_client/commit/44cdbfd))
* **config:** asset path 의  모든 js 와 css 를 include 하도록 수정 ([97b73b3](https://github.com/tosslab/web_client/commit/97b73b3))
* **config:** 팀 정보 tosslab 으로 수정 ([8ab4ca6](https://github.com/tosslab/web_client/commit/8ab4ca6))
* **markdown:** 마크다운에서 한글 한 글자만 적용 시 적용되지 않는 현상 수정 ([7599489](https://github.com/tosslab/web_client/commit/7599489))
* **modal:** 업로드 진행바 버그 수정 ([964b18f](https://github.com/tosslab/web_client/commit/964b18f))
* **modal:** 업로드 진행바 버그 수정 ([a0d0a83](https://github.com/tosslab/web_client/commit/a0d0a83))
* **modal:** 팀 초대 모달의 링크복사 가이드가 pc app에서 사라지지 않는 버그 수정 ([65ee33b](https://github.com/tosslab/web_client/commit/65ee33b))
* **right:** 검색 시 이전, 다음 메세지의 경우 markdown 적용되지 않도록 수정 ([43806a9](https://github.com/tosslab/web_client/commit/43806a9))
* **right:** 메세지 검색결과 중 이전 혹은 다음 메세지가 file 일 경우 parser error 오류 수정 ([0b39a7a](https://github.com/tosslab/web_client/commit/0b39a7a))
* **right:** 메세지 텝 버그 수정 ([a0680d6](https://github.com/tosslab/web_client/commit/a0680d6))
* **right:** 메세지 텝 버그 수정 ([d7263bb](https://github.com/tosslab/web_client/commit/d7263bb))
* **right:** 메세지 텝 버그 수정 ([dd2d6dd](https://github.com/tosslab/web_client/commit/dd2d6dd))
* **right:** 메세지 텝 버그 수정 ([2c46dfa](https://github.com/tosslab/web_client/commit/2c46dfa))
* **right:** 메시지 검색 결과의 이전/다음 메시지의 경우 code markdown은 파싱하지 않도록 (공지사항과 같은 정책) 수정 ([0949377](https://github.com/tosslab/web_client/commit/0949377))
* **right:** 스타 멘션탭에 html 코드 포함 시 출력되지 않는 현상 수정 ([388b1fa](https://github.com/tosslab/web_client/commit/388b1fa))
* **right:** 우측패널 markdown 적용 ([96a6592](https://github.com/tosslab/web_client/commit/96a6592))
* **scroll:** r panel 노출 여부에 따른 center 너비 변화 시 스크롤 보정 로직에 scroll animation 효과 제거 ([e1ee73b](https://github.com/tosslab/web_client/commit/e1ee73b))
* **socket:** socket 연결 재시도 딜레이 조정 ([76aae1f](https://github.com/tosslab/web_client/commit/76aae1f))
* **tutorial:** 튜토리얼 스크롤 노출되지 않는 현상 해결 ([beafaa4](https://github.com/tosslab/web_client/commit/beafaa4))

### Features

* **center:** 초기 진입시 흰 화면 대신 로딩 화면 추가 ([34fe151](https://github.com/tosslab/web_client/commit/34fe151))
* **filter:** markdown 필터 추가 ([e4506c0](https://github.com/tosslab/web_client/commit/e4506c0))
* **loading:** 초기 진입 시 loading 화면 추가 ([8749af5](https://github.com/tosslab/web_client/commit/8749af5))



<a name"1.3.4"></a>
### 1.3.4 (2015-10-12)


#### Bug Fixes

* **center:** {{{ 문자 }}} 일 경우 흰 화면 노출되는 현상 수정 ([a75c7a15](https://github.com/tosslab/web_client.git/commit/a75c7a15))


<a name"1.3.3"></a>
### 1.3.3 (2015-10-08)


#### Bug Fixes

* **right:** 파일 리스트 출력시 검색 키워드는 전체 파일 리스트가 갱신 될때만 초기화 하도록 수정 ([541fcc02](https://github.com/tosslab/web_client.git/commit/541fcc02))


<a name"1.3.2"></a>
### 1.3.2 (2015-10-08)


#### Bug Fixes

* **app:** 웹폰트 롤벡 ([ea990708](https://github.com/tosslab/web_client.git/commit/ea990708))


<a name"1.3.1"></a>
### 1.3.1 (2015-10-08)


#### Bug Fixes

* **center:** 초대 시스템 메세지 처리 누락 수정 ([6d5c625f](https://github.com/tosslab/web_client.git/commit/6d5c625f))


<a name"1.3.0"></a>
## 1.3.0 (2015-10-07)


#### Bug Fixes

* **desktop.banner:** Change class name from 'icon-cancel' to 'icon-delete'   - #JND-3639 #resolve ([f65c1221](https://github.com/tosslab/web_client.git/commit/f65c1221))
* **font:** fix url ([367c5582](https://github.com/tosslab/web_client.git/commit/367c5582))
* **invited.notification:** Fix korean L10N. ([5c1c77a9](https://github.com/tosslab/web_client.git/commit/5c1c77a9))
* **l10n:** Display different message for public/private topic invitation. ([97a8888e](https://github.com/tosslab/web_client.git/commit/97a8888e))
* **link.preview.thumbnail:** Fix minor issue with loading wheel. ([6d5d8a3d](https://github.com/tosslab/web_client.git/commit/6d5d8a3d))
* **modal:**
  * 팀 초대 모달의 email 구분 정규식 수정 ([9eda3f61](https://github.com/tosslab/web_client.git/commit/9eda3f61))
  * 팀 초대 모달의 email 구분 정규식 수정 ([ec70763c](https://github.com/tosslab/web_client.git/commit/ec70763c))
  * 팀 초대 email 전송에 모두 실패 하였을때 다음 순서로 넘어가지 않고 error toast 출력하도록 수정 ([ef8a33b8](https://github.com/tosslab/web_client.git/commit/ef8a33b8))
  * 팀 초대 모달의 style 수정 ([9e2d7bc4](https://github.com/tosslab/web_client.git/commit/9e2d7bc4))
  * 팀 초대 모달의 style 수정 ([611f41e5](https://github.com/tosslab/web_client.git/commit/611f41e5))
  * remove console.log ([260baed3](https://github.com/tosslab/web_client.git/commit/260baed3))
  * 팀 초대 모달의 style 수정 ([b8346091](https://github.com/tosslab/web_client.git/commit/b8346091))
  * fix team invite L10N ([418ffa87](https://github.com/tosslab/web_client.git/commit/418ffa87))
  * fix team invite L10N ([41b23eec](https://github.com/tosslab/web_client.git/commit/41b23eec))
  * fix team invite L10N ([eaa20b99](https://github.com/tosslab/web_client.git/commit/eaa20b99))
  * team invite modal bak ([930ccb5b](https://github.com/tosslab/web_client.git/commit/930ccb5b))
  * team invite modal   - email split 정규식에 스페이스, 탭, 폼피드, 줄 바꿈 문자등을 포함한 하나의 공백 문자를 포함 ([4145442f](https://github.com/tosslab/web_client.git/commit/4145442f))
  * team invite modal   - 클릭보드에 복사 제공하지 않는 browser에서는 text copy 편하게 하도록 UI/UX수정 ([95bad26f](https://github.com/tosslab/web_client.git/commit/95bad26f))
  * team invite bak ([e7b8ee70](https://github.com/tosslab/web_client.git/commit/e7b8ee70))
  * team invite bak ([c5abc026](https://github.com/tosslab/web_client.git/commit/c5abc026))
  * team invite bak ([bf5fe796](https://github.com/tosslab/web_client.git/commit/bf5fe796))
  * team invitation bak ([df2be48a](https://github.com/tosslab/web_client.git/commit/df2be48a))
* **notification:** Extend duration of desktop notification.   - #JND-3637 #resolve ([edd37ac6](https://github.com/tosslab/web_client.git/commit/edd37ac6))
* **right:**
  * 한글자 검색 불가능하도록 수정 & message tab 검색 정책 변경사항 반영  - 검색의 마지막을 표시하는 image가 검색어 삭제 후에도  ([33c4afcb](https://github.com/tosslab/web_client.git/commit/33c4afcb))
  * 한글자 검색 불가능하도록 수정 & message tab 검색 정책 변경사항 반영 ([ef945c86](https://github.com/tosslab/web_client.git/commit/ef945c86))
* **topic.invitation.notification:** Finish first draft. ([1899761e](https://github.com/tosslab/web_client.git/commit/1899761e))
* **topic.invited.notification:**
  * Fix notification sentence. ([bb5cd0c2](https://github.com/tosslab/web_client.git/commit/bb5cd0c2))
  * Show notification message when there is no room name. ([8d97c5d2](https://github.com/tosslab/web_client.git/commit/8d97c5d2))
* **tutorial:** 초대 모달 스타일 변경 대응 ([dabd2706](https://github.com/tosslab/web_client.git/commit/dabd2706))


<a name"1.2.5"></a>
### 1.2.5 (2015-10-07)


#### Bug Fixes

* **config:** 웹소켓 장애 긴급 대응으로 인해 웹소켓 주소 변경   - https://ws.jandi.com --> https://ws0.jandi.com/ ([548edd1a](https://github.com/tosslab/web_client.git/commit/548edd1a))


<a name"1.2.4"></a>
### 1.2.4 (2015-10-05)


#### Bug Fixes

* **modal:** 팀 초대 링크 복사를 제공할 수 없는 Browser에 한하여 복사 버튼 보이지 않도록 수정 ([e36db3d7](https://github.com/tosslab/web_client.git/commit/e36db3d7))


<a name"1.2.3"></a>
### 1.2.3 (2015-10-02)


#### Bug Fixes

* **center:** fix message braces ([0ca210ea](https://github.com/tosslab/web_client.git/commit/0ca210ea))


<a name"1.2.2"></a>
### 1.2.2 (2015-10-01)


#### Bug Fixes

* **modal:** 파일 업로드 취소시(esc key를 사용) file uploader object 살아 있는 버그 수정 ([43692a25](https://github.com/tosslab/web_client.git/commit/43692a25))


<a name"1.2.1"></a>
### 1.2.1 (2015-10-01)


#### Bug Fixes

* **center:** 파일에 코멘트 입력시 layout 어그러지는 버그 수정 ([9367e3ef](https://github.com/tosslab/web_client.git/commit/9367e3ef))


<a name"1.2.0"></a>
## 1.2.0 (2015-09-30)


#### Bug Fixes

* **center:**
  * thumbnail 생성되지 못한 image에 대한 image가 모든 브라우저에서 제대로 보이도록 수정 ([45b62c0c](https://github.com/tosslab/web_client.git/commit/45b62c0c))
  * thumbnail image 출력시 background color는 opacity에 영향 받지 않도록 수정 ([75fd1c0b](https://github.com/tosslab/web_client.git/commit/75fd1c0b))
  * fix mention ahead.   - mention ahead가 출력되어 질때 blink 현상 수정   - 한글 입력시 현재 입력중인 tex ([d8569b50](https://github.com/tosslab/web_client.git/commit/d8569b50))
  * fix mention ahead.   - mention ahead가 출력되어 질때 blink 현상 수정   - 한글 입력시 현재 입력중인 tex ([a1f881df](https://github.com/tosslab/web_client.git/commit/a1f881df))
  * scrollToBottom 호출시 animation option 추가 & 파일 상세 텝 오픈시 scroll이 bottom에 있다면 유지하도록 수 ([3e085704](https://github.com/tosslab/web_client.git/commit/3e085704))
  * file upload중 topic 이동시 progress bar가 초기화 되는 버그 수정 ([804cb543](https://github.com/tosslab/web_client.git/commit/804cb543))
  * 원본 이미지 로딩시 무한 로딩바 돌지 않도록 수정 ([4585190a](https://github.com/tosslab/web_client.git/commit/4585190a))
  * 원본 이미지 로딩시 무한 로딩바 돌지 않도록 수정 ([75a59960](https://github.com/tosslab/web_client.git/commit/75a59960))
  * 원본 이미지 로딩시 무한 로딩바 돌지 않도록 수정 ([a124b03a](https://github.com/tosslab/web_client.git/commit/a124b03a))
  * thumbnail 생성되지 않는 이미지도 원본보기 제공하도록 수정 ([4d5b7c63](https://github.com/tosslab/web_client.git/commit/4d5b7c63))
  * 업로드 api 버전 변경 ([74bf3632](https://github.com/tosslab/web_client.git/commit/74bf3632))
  * 접기/펼치기 버튼 제거 ([7fa9b9cd](https://github.com/tosslab/web_client.git/commit/7fa9b9cd))
  * center의 thumbnail image 표현 ui/ux변경함   - small thumbnail -> large thumbnail toggl ([ce6d1cd6](https://github.com/tosslab/web_client.git/commit/ce6d1cd6))
  * center thumbnail bak ([7f3b4889](https://github.com/tosslab/web_client.git/commit/7f3b4889))
  * center thumbnail bak ([07b4ae53](https://github.com/tosslab/web_client.git/commit/07b4ae53))
  * bak ([fed00b20](https://github.com/tosslab/web_client.git/commit/fed00b20))
* **dialog:** Dialog style 수정 branch ([8ec88bff](https://github.com/tosslab/web_client.git/commit/8ec88bff))
* **left:**
  * 뱃지 카운트 999 이상일 때 999+ 로 노출하도록 수정 ([d5c20b5d](https://github.com/tosslab/web_client.git/commit/d5c20b5d))
  * 뱃지 카운트 999 이상일 때 999+ 로 노출하도록 수정 ([6f9b7aa8](https://github.com/tosslab/web_client.git/commit/6f9b7aa8))
* **modal:**
  * member 선택 후 더이상 member가 존재하지 않을때는 모든 member를 출력하도록 수정 ([369a2ecb](https://github.com/tosslab/web_client.git/commit/369a2ecb))
  * LowerCase로 정렬하도록 수정 ([d3dc254a](https://github.com/tosslab/web_client.git/commit/d3dc254a))
  * LowerCase로 정렬하도록 수정 ([62fff938](https://github.com/tosslab/web_client.git/commit/62fff938))


#### Features

* **center:**
  * Center panel 에서 파일에 코멘트가 달린 경우 파일 썸네일 영역에 링크 기능 부여   - JND-3404 #resolve ([7af7783e](https://github.com/tosslab/web_client.git/commit/7af7783e))
  * enter key 입력시 center input 에 포커스 가도록 수정   - JND-3229 #resolve ([f0fa67cb](https://github.com/tosslab/web_client.git/commit/f0fa67cb))
* **link.preview:** Add loading wheel when waiting for link preview thumbnail. ([ab1077d1](https://github.com/tosslab/web_client.git/commit/ab1077d1))


<a name"1.1.9"></a>
### 1.1.9 (2015-09-24)


#### Bug Fixes

* **center:**
  * Loading 휠의 배경에 그라데이션 현상 수정. 휠 노출 시간 500ms--> 800ms 변경 ([ac8a92e8](https://github.com/tosslab/web_client.git/commit/ac8a92e8))
  * Left 패널에서 A 토픽 더블클릭 시 default topic 으로 이동되는 현상 수정 ([5fb273f2](https://github.com/tosslab/web_client.git/commit/5fb273f2))
  * default 토픽에서는 kickout 메뉴 노출되지 않도록 수정 ([bb3e2b49](https://github.com/tosslab/web_client.git/commit/bb3e2b49))


<a name"1.1.8"></a>
### 1.1.8 (2015-09-24)


#### Bug Fixes

* **profile:** profile modal을 통해 mail전달 되도록 수정 ([7bd88aeb](https://github.com/tosslab/web_client.git/commit/7bd88aeb))
* **right:** 토픽 변경시 파일검색 키워드를 초기화 하도록 수정 ([2d498490](https://github.com/tosslab/web_client.git/commit/2d498490))


<a name"1.1.7"></a>
### 1.1.7 (2015-09-23)


#### Bug Fixes

* **dm.file.share:** Do not send browser notification when I share a file on dm.   - #JND-3540 #resol ([5d936550](https://github.com/tosslab/web_client.git/commit/5d936550))


<a name"1.1.6"></a>
### 1.1.6 (2015-09-23)


#### Bug Fixes

* **grunt:** fix version release script ([00a915e6](https://github.com/tosslab/web_client.git/commit/00a915e6))
* **readme:**
  * 내용 추가 ([da6c1994](https://github.com/tosslab/web_client.git/commit/da6c1994))
  * 내용 추가 ([44479759](https://github.com/tosslab/web_client.git/commit/44479759))


<a name"1.1.5"></a>
### 1.1.5 (2015-09-23)


#### Bug Fixes

* **404:** 디자인 pull request 적용   - https://github.com/tosslab/web_client/pull/218/files ([8976ecda](https://github.com/tosslab/web_client.git/commit/8976ecda))
* **L10N:**
  * L10N 수정 ([5279f0c5](https://github.com/tosslab/web_client.git/commit/5279f0c5))
  * 로그인 페이지 가입하기 L10N 적용 ([c4ad65bb](https://github.com/tosslab/web_client.git/commit/c4ad65bb))
* **center:**
  * loading 휠 관련 수정 ([1fd00f60](https://github.com/tosslab/web_client.git/commit/1fd00f60))
  * 공유된 대화방 이동 L10N 수정 ([089bf58c](https://github.com/tosslab/web_client.git/commit/089bf58c))
  * 서버 응답이 500ms 보다 늦어질 경우 center loading wheel 을 노출한다. ([13116e6e](https://github.com/tosslab/web_client.git/commit/13116e6e))
  *  CSS Pull request 적용   - https://github.com/tosslab/web_client/pull/202/files ([311e9fcb](https://github.com/tosslab/web_client.git/commit/311e9fcb))
* **config:**
  * package.json 콘피그 오류 수정 ([1a454b7d](https://github.com/tosslab/web_client.git/commit/1a454b7d))
  * config.js 자동으로 생성되므로 git에서 제거 ([9831153c](https://github.com/tosslab/web_client.git/commit/9831153c))
  * git ignore 에 config 도 추가 ([24269d94](https://github.com/tosslab/web_client.git/commit/24269d94))
  * git ignore 에 local.team.json 제거 ([a0bfb841](https://github.com/tosslab/web_client.git/commit/a0bfb841))
  * tosslab 이 기본 팀이 되도록 수정 ([3d58967b](https://github.com/tosslab/web_client.git/commit/3d58967b))
  * local 작업에서 config 파일로 team prefix 수정 가능하도록 추가 ([7250d6b3](https://github.com/tosslab/web_client.git/commit/7250d6b3))
* **confilct:** resolve conflict with develop ([ae09b3ae](https://github.com/tosslab/web_client.git/commit/ae09b3ae))
* **dialog:**
  * 비공개 토픽 나가기시 Dialog 사용하도록 수정 ([99955b1a](https://github.com/tosslab/web_client.git/commit/99955b1a))
  * 비공개 토픽 나가기시 Dialog 사용하도록 수정 ([04ff98f9](https://github.com/tosslab/web_client.git/commit/04ff98f9))
* **dm.file.share:**
  * Update center when file is uploaded from me. ([9c7637ea](https://github.com/tosslab/web_client.git/commit/9c7637ea))
  * Update center and lef on first file share event.   -#JND-3458 #resolve ([8b597014](https://github.com/tosslab/web_client.git/commit/8b597014))
  * Update chat list when file is shared to dm.   - #JND-3458 #resolve ([26a90fe9](https://github.com/tosslab/web_client.git/commit/26a90fe9))
* **favicon:** Change favicon image assets. ([a4e811ad](https://github.com/tosslab/web_client.git/commit/a4e811ad))
* **file.upload:**
  * upload api v2 사용하도록 수정 ([a353a80a](https://github.com/tosslab/web_client.git/commit/a353a80a))
  * file upload시 작성된 message가 comment로 들어갈 수 있도록 수정 ([3ff3d046](https://github.com/tosslab/web_client.git/commit/3ff3d046))
* **grunt:** fix version release script ([00a915e6](https://github.com/tosslab/web_client.git/commit/00a915e6))
* **left:**
  * 리뷰용 주석 추가 ([f2030a36](https://github.com/tosslab/web_client.git/commit/f2030a36))
  * 폴더명 변경 시 input 에서 텍스트 드래그 불가한 현상 수정 ([debb4ed1](https://github.com/tosslab/web_client.git/commit/debb4ed1))
  * 검색이나, push로 진입한 토픽의 폴더명이 Bold 표시되지 않음 문제 해결   - 더블클릭 시 디폴트 토픽으로 이동하는 문제 해결   - J ([8f6ba2c7](https://github.com/tosslab/web_client.git/commit/8f6ba2c7))
  * 폴더를 접을 때 [ … ] 아이콘 위에 빨간 unread badge가 오버랩 되었다가 사라짐 현상 해결   - JND-3515 #resolve ([fd3f67f9](https://github.com/tosslab/web_client.git/commit/fd3f67f9))
  * 코드리뷰 준비   - 주석 추가 및 코드 정리   - safeApply 적용 ([fb075e9e](https://github.com/tosslab/web_client.git/commit/fb075e9e))
  * go unread below 수정 ([30a47de6](https://github.com/tosslab/web_client.git/commit/30a47de6))
* **mention:**
  * mention 작성시 "@all" 출력되지 않는 버그 수정 ([f07adabc](https://github.com/tosslab/web_client.git/commit/f07adabc))
  * mention 작성시 "@all" 출력되는 text 수정 ([3945cf92](https://github.com/tosslab/web_client.git/commit/3945cf92))
* **modals:** 버그 및 기능 변경   - safari에서 scrolling 가속 적용되도록 수정   - firefox에서 tab 변경시 item이 생성되지 않 ([ef58902e](https://github.com/tosslab/web_client.git/commit/ef58902e))
* **readme:**
  * 내용 추가 ([da6c1994](https://github.com/tosslab/web_client.git/commit/da6c1994))
  * 내용 추가 ([44479759](https://github.com/tosslab/web_client.git/commit/44479759))
* **right:**
  * integration file download ([59bc0ddf](https://github.com/tosslab/web_client.git/commit/59bc0ddf))
  * right panel에서 사용하는 message card가 disable member를 표현하도록 수정 ([1fc65c29](https://github.com/tosslab/web_client.git/commit/1fc65c29))
* **signin:** 주석 추가 ([ce8d8fbf](https://github.com/tosslab/web_client.git/commit/ce8d8fbf))


<a name"1.1.5"></a>
### 1.1.5 (2015-09-23)


#### Bug Fixes

* **404:** 디자인 pull request 적용   - https://github.com/tosslab/web_client/pull/218/files ([8976ecda](https://github.com/tosslab/web_client.git/commit/8976ecda))
* **L10N:**
  * L10N 수정 ([5279f0c5](https://github.com/tosslab/web_client.git/commit/5279f0c5))
  * 로그인 페이지 가입하기 L10N 적용 ([c4ad65bb](https://github.com/tosslab/web_client.git/commit/c4ad65bb))
* **center:**
  * loading 휠 관련 수정 ([1fd00f60](https://github.com/tosslab/web_client.git/commit/1fd00f60))
  * 공유된 대화방 이동 L10N 수정 ([089bf58c](https://github.com/tosslab/web_client.git/commit/089bf58c))
  * 서버 응답이 500ms 보다 늦어질 경우 center loading wheel 을 노출한다. ([13116e6e](https://github.com/tosslab/web_client.git/commit/13116e6e))
  *  CSS Pull request 적용   - https://github.com/tosslab/web_client/pull/202/files ([311e9fcb](https://github.com/tosslab/web_client.git/commit/311e9fcb))
* **config:**
  * package.json 콘피그 오류 수정 ([1a454b7d](https://github.com/tosslab/web_client.git/commit/1a454b7d))
  * config.js 자동으로 생성되므로 git에서 제거 ([9831153c](https://github.com/tosslab/web_client.git/commit/9831153c))
  * git ignore 에 config 도 추가 ([24269d94](https://github.com/tosslab/web_client.git/commit/24269d94))
  * git ignore 에 local.team.json 제거 ([a0bfb841](https://github.com/tosslab/web_client.git/commit/a0bfb841))
  * tosslab 이 기본 팀이 되도록 수정 ([3d58967b](https://github.com/tosslab/web_client.git/commit/3d58967b))
  * local 작업에서 config 파일로 team prefix 수정 가능하도록 추가 ([7250d6b3](https://github.com/tosslab/web_client.git/commit/7250d6b3))
* **confilct:** resolve conflict with develop ([ae09b3ae](https://github.com/tosslab/web_client.git/commit/ae09b3ae))
* **dialog:**
  * 비공개 토픽 나가기시 Dialog 사용하도록 수정 ([99955b1a](https://github.com/tosslab/web_client.git/commit/99955b1a))
  * 비공개 토픽 나가기시 Dialog 사용하도록 수정 ([04ff98f9](https://github.com/tosslab/web_client.git/commit/04ff98f9))
* **dm.file.share:**
  * Update center when file is uploaded from me. ([9c7637ea](https://github.com/tosslab/web_client.git/commit/9c7637ea))
  * Update center and lef on first file share event.   -#JND-3458 #resolve ([8b597014](https://github.com/tosslab/web_client.git/commit/8b597014))
  * Update chat list when file is shared to dm.   - #JND-3458 #resolve ([26a90fe9](https://github.com/tosslab/web_client.git/commit/26a90fe9))
* **favicon:** Change favicon image assets. ([a4e811ad](https://github.com/tosslab/web_client.git/commit/a4e811ad))
* **file.upload:**
  * upload api v2 사용하도록 수정 ([a353a80a](https://github.com/tosslab/web_client.git/commit/a353a80a))
  * file upload시 작성된 message가 comment로 들어갈 수 있도록 수정 ([3ff3d046](https://github.com/tosslab/web_client.git/commit/3ff3d046))
* **grunt:** fix version release script ([00a915e6](https://github.com/tosslab/web_client.git/commit/00a915e6))
* **left:**
  * 리뷰용 주석 추가 ([f2030a36](https://github.com/tosslab/web_client.git/commit/f2030a36))
  * 폴더명 변경 시 input 에서 텍스트 드래그 불가한 현상 수정 ([debb4ed1](https://github.com/tosslab/web_client.git/commit/debb4ed1))
  * 검색이나, push로 진입한 토픽의 폴더명이 Bold 표시되지 않음 문제 해결   - 더블클릭 시 디폴트 토픽으로 이동하는 문제 해결   - J ([8f6ba2c7](https://github.com/tosslab/web_client.git/commit/8f6ba2c7))
  * 폴더를 접을 때 [ … ] 아이콘 위에 빨간 unread badge가 오버랩 되었다가 사라짐 현상 해결   - JND-3515 #resolve ([fd3f67f9](https://github.com/tosslab/web_client.git/commit/fd3f67f9))
  * 코드리뷰 준비   - 주석 추가 및 코드 정리   - safeApply 적용 ([fb075e9e](https://github.com/tosslab/web_client.git/commit/fb075e9e))
  * go unread below 수정 ([30a47de6](https://github.com/tosslab/web_client.git/commit/30a47de6))
* **mention:**
  * mention 작성시 "@all" 출력되지 않는 버그 수정 ([f07adabc](https://github.com/tosslab/web_client.git/commit/f07adabc))
  * mention 작성시 "@all" 출력되는 text 수정 ([3945cf92](https://github.com/tosslab/web_client.git/commit/3945cf92))
* **modals:** 버그 및 기능 변경   - safari에서 scrolling 가속 적용되도록 수정   - firefox에서 tab 변경시 item이 생성되지 않 ([ef58902e](https://github.com/tosslab/web_client.git/commit/ef58902e))
* **readme:** 내용 추가 ([44479759](https://github.com/tosslab/web_client.git/commit/44479759))
* **right:**
  * integration file download ([59bc0ddf](https://github.com/tosslab/web_client.git/commit/59bc0ddf))
  * right panel에서 사용하는 message card가 disable member를 표현하도록 수정 ([1fc65c29](https://github.com/tosslab/web_client.git/commit/1fc65c29))
* **signin:** 주석 추가 ([ce8d8fbf](https://github.com/tosslab/web_client.git/commit/ce8d8fbf))


<a name"1.1.3"></a>
### 1.1.3 (2015-09-17)


<a name"1.1.1"></a>
### 1.1.1 (2015-09-17)


<a name"1.1.0"></a>
## 1.1.0 (2015-09-16)


<a name"1.0.5"></a>
### 1.0.5 (2015-09-16)


<a name"1.0.0"></a>
## 1.0.0 (2015-09-02)


