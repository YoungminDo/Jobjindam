// app/(auth)/register/page.tsx
export default function RegisterPage() {
  return (
    <>
      <h2>회원가입</h2>
      <form>
        <input
          type="email"
          placeholder="이메일"
          style={{ display: "block", marginBottom: 12 }}
        />
        <input
          type="password"
          placeholder="비밀번호"
          style={{ display: "block", marginBottom: 12 }}
        />
        <button type="submit">가입하기</button>
      </form>
    </>
  );
}
