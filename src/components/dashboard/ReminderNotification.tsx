import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bell, Clock, Smartphone } from "lucide-react";

const DEFAULT_MESSAGE =
  "Jangan lupa absen pulang sekarang juga agar data kehadiranmu tercatat dengan baik.";

const ReminderNotification = () => {
  console.log("ReminderNotification component rendered");
  
  const [permission, setPermission] = useState<NotificationPermission>(() =>
    typeof Notification !== "undefined" ? Notification.permission : "default",
  );
  const [time, setTime] = useState(() => localStorage.getItem("reminder-time") || "17:00");
  const [message, setMessage] = useState(() => localStorage.getItem("reminder-message") || DEFAULT_MESSAGE);
  const [nextReminder, setNextReminder] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      alert("Browser Anda tidak mendukung notifikasi.");
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  const scheduleReminder = async () => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      alert("Notifikasi tidak didukung pada perangkat ini.");
      return;
    }

    if (permission !== "granted") {
      await requestPermission();
      if (Notification.permission !== "granted") {
        return;
      }
    }

    const registration = await navigator.serviceWorker.ready;
    const [hours, minutes] = time.split(":").map(Number);
    const now = new Date();
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);
    if (target <= now) {
      target.setDate(target.getDate() + 1);
    }

    const delay = target.getTime() - now.getTime();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      await registration.showNotification("Pengingat Absen Pulang", {
        body: message,
        icon: "/logo website.png",
        badge: "/logo website.png",
        tag: "absen-pulang-reminder",
      });
      scheduleReminder();
    }, delay);

    localStorage.setItem("reminder-time", time);
    localStorage.setItem("reminder-message", message);
    setNextReminder(target.toLocaleString("id-ID"));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Pengingat Absen Pulang
          </CardTitle>
          <CardDescription>
            Jadwalkan notifikasi otomatis di browser/handphone agar tidak lupa melakukan absen pulang.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {permission !== "granted" && (
            <Alert>
              <Smartphone className="h-4 w-4" />
              <AlertTitle>Izinkan Notifikasi</AlertTitle>
              <AlertDescription>
                Klik tombol di bawah untuk mengaktifkan notifikasi browser pada perangkat Anda.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Jam Pengingat
              </label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Pesan Notifikasi</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Isi pesan yang akan muncul di notifikasi"
              />
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Button onClick={requestPermission} variant="outline">
              Aktifkan Notifikasi
            </Button>
            <Button onClick={scheduleReminder}>Simpan & Jadwalkan</Button>
          </div>

          {nextReminder && (
            <p className="text-sm text-muted-foreground">
              Pengingat berikutnya akan muncul pada: <span className="font-medium">{nextReminder}</span>
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tips Menggunakan Pengingat</CardTitle>
          <CardDescription>Pastikan Anda sudah meng-install aplikasi sebagai PWA di perangkat mobile.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• Izinkan notifikasi ketika diminta browser.</p>
          <p>• Tambahkan aplikasi ke layar utama (Add to Home Screen) agar notifikasi mudah terlihat.</p>
          <p>• Notifikasi dijadwalkan ulang setiap hari sesuai jam yang sudah ditentukan.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReminderNotification;

