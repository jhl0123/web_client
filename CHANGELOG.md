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


