# انتشار چاپ‌یار روی GitHub Pages — دامنه sabzevartechnic.ir

**وضعیت فعلی:** ریپوی `sadeghvahidi80/sabzevartechnic` ساخته و پوش شده و Pages فعال است.
سایت فعلاً از پیش‌نمایش گیت‌هاب سرو می‌شود؛ فقط **DNS** مانده که در داشبورد **Cloudflare** ست شود
(NSهای این دامنه روی Cloudflare هستند، نه پنل nic.ir).

بسته شامل فایل‌های سایت + `CNAME` (دامنه اختصاصی) + `.nojekyll` (غیرفعال‌کردن Jekyll) است.
همه آدرس‌های سئو (`config.js`، canonical، og:url، robots.txt، sitemap.xml) به `https://sabzevartechnic.ir` اشاره می‌کنند.

---

## مرحله ۱ — DNS در داشبورد Cloudflare (تنها قدم دستی باقی‌مانده)
ورود به dash.cloudflare.com → دامنه `sabzevartechnic.ir` → **DNS**:

رکوردهای فعلی ریشه (A/AAAA با ابر نارنجی — 104.21.x / 172.67.x) را **حذف یا ویرایش** کنید و این‌ها را بسازید:

| نوع | نام (Host) | مقدار (Value) | Proxy |
|-----|-----------|----------------|-------|
| A   | `@`       | `185.199.108.153` | DNS only (ابر خاکستری) |
| A   | `@`       | `185.199.109.153` | DNS only |
| A   | `@`       | `185.199.110.153` | DNS only |
| A   | `@`       | `185.199.111.153` | DNS only |
| CNAME | `www`   | `sadeghvahidi80.github.io` | DNS only |

- «DNS only» یعنی ابر را خاکستری کنید — ساده‌ترین حالت، HTTPS را خود گیت‌هاب می‌دهد (همان الگوی sadeghvahidi.ir).
- انتشار DNS چند دقیقه تا چند ساعت ممکن است طول بکشد.

> پیشرفته (اختیاری): اگر بعداً خواستی ابر نارنجی (پروکسی کلادفلر) روشن بماند،
> SSL/TLS → Overview → حالت **Full** و Always Use HTTPS را در کلادفلر فعال کن؛
> سایت کار می‌کند ولی چک دامنه در گیت‌هاب ممکن است «unverified» نشان دهد. برای شروع DNS only کافی است.

## مرحله ۲ — ثبت دامنه در Pages
1. `github.com/sadeghvahidi80/sabzevartechnic` → **Settings → Pages**
2. جعبه **Custom domain**: بنویس `sabzevartechnic.ir` → **Save**
3. بعد از سبز شدن چک DNS (چند دقیقه) تیک **Enforce HTTPS** را فعال کن
4. از این لحظه `www` هم خودکار به دامنه اصلی ریدایرکت می‌شود

## مرحله ۳ — تایید نهایی
- باز کن `https://sabzevartechnic.ir` — صفحه باید کامل با فونت و آیکون‌ها بالا بیاید
- پیش‌نمایش تستی (قبل از DNS): `https://sadeghvahidi80.github.io/sabzevartechnic/`
- در Google Search Console → Sitemap: `https://sabzevartechnic.ir/sitemap.xml`

---

## نکات عملیاتی
- به‌روزرسانی سایت: فایل را در `_github_chapyar` عوض کن، commit و push (یا از وب آپلود کن) — بیلد خودکار.
- `.htaccess` و `_headers` روی GitHub نادیده گرفته می‌شوند (بی‌ضرر؛ برای هاست آپاچی/کلادفلر آینده نگه داشته شده‌اند).
- محدودیت Pages: هر فایل ≤100MB، کل ریپو ≤1GB — بسته ما ~300KB.
- برگشت‌پذیری: هر وقت دامنه اصلی (sabzevarchap.ir) تهیه شد، فقط CNAME و آدرس‌های سئو را دوباره همان دامنه کن و DNS را عوض — همان روش همین راهنما.
