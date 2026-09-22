using System;
using System.IO;
using System.IO.Compression;
using System.Reflection;
using System.Diagnostics;
using System.Windows.Forms;

namespace RishuKeyJutsu
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            try
            {
                string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
                string appDir = Path.Combine(localAppData, "RishuKeyJutsu");
                string installedHtml = Path.Combine(appDir, "play.html");
                string installedExe = Path.Combine(appDir, "RishuKeyJutsu.exe");
                string installedIcon = Path.Combine(appDir, "assets", "app_icon.ico");

                // 1. Ensure permanent installation folder exists
                if (!Directory.Exists(appDir))
                {
                    Directory.CreateDirectory(appDir);
                }

                // 2. Extract embedded content if not already present
                if (!File.Exists(installedHtml))
                {
                    Assembly asm = Assembly.GetExecutingAssembly();
                    using (Stream resStream = asm.GetManifestResourceStream("GameContent"))
                    {
                        if (resStream != null)
                        {
                            string tempZip = Path.Combine(Path.GetTempPath(), "rishu_install_" + Guid.NewGuid().ToString("N") + ".zip");
                            using (FileStream fs = new FileStream(tempZip, FileMode.Create, FileAccess.Write))
                            {
                                resStream.CopyTo(fs);
                            }

                            try
                            {
                                ZipFile.ExtractToDirectory(tempZip, appDir);
                            }
                            finally
                            {
                                if (File.Exists(tempZip))
                                {
                                    try { File.Delete(tempZip); } catch { }
                                }
                            }
                        }
                    }
                }

                // 3. Copy running exe to permanent app directory
                try
                {
                    string currentExePath = Assembly.GetExecutingAssembly().Location;
                    if (!string.IsNullOrEmpty(currentExePath) && !string.Equals(currentExePath, installedExe, StringComparison.OrdinalIgnoreCase))
                    {
                        File.Copy(currentExePath, installedExe, true);
                    }
                }
                catch { }

                // 4. Create Desktop & Start Menu Shortcuts permanently
                CreateAppShortcuts(File.Exists(installedExe) ? installedExe : Assembly.GetExecutingAssembly().Location, installedIcon);

                // 5. Determine launch HTML
                string targetHtml = null;
                string exeDir = AppDomain.CurrentDomain.BaseDirectory;
                string localHtml = Path.Combine(exeDir, "play.html");
                if (File.Exists(localHtml))
                {
                    targetHtml = localHtml;
                }
                else if (File.Exists(installedHtml))
                {
                    targetHtml = installedHtml;
                }

                // 6. Fallback URI
                string launchUri;
                if (targetHtml != null && File.Exists(targetHtml))
                {
                    launchUri = "file:///" + targetHtml.Replace('\\', '/');
                }
                else
                {
                    launchUri = "https://keyjutsu-game.vercel.app/play.html";
                }

                // 7. Launch browser in chromeless App Mode
                LaunchAppMode(launchUri);
            }
            catch (Exception ex)
            {
                try
                {
                    Process.Start(new ProcessStartInfo("https://keyjutsu-game.vercel.app/play.html") { UseShellExecute = true });
                }
                catch
                {
                    MessageBox.Show("Error opening Rishu Key Jutsu:\n" + ex.Message, "Rishu Key Jutsu", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
            }
        }

        private static void CreateAppShortcuts(string targetExe, string iconPath)
        {
            try
            {
                Type shellType = Type.GetTypeFromProgID("WScript.Shell");
                if (shellType == null) return;

                object shell = Activator.CreateInstance(shellType);
                if (shell == null) return;

                // Desktop shortcut
                string desktopDir = Environment.GetFolderPath(Environment.SpecialFolder.Desktop);
                if (!string.IsNullOrEmpty(desktopDir))
                {
                    string desktopLnk = Path.Combine(desktopDir, "Rishu Key Jutsu.lnk");
                    MakeShortcut(shell, shellType, desktopLnk, targetExe, iconPath, "Rishu Key Jutsu — Martial Arts Touch Typing Combat");
                }

                // Start Menu shortcut
                string startMenuPrograms = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), @"Microsoft\Windows\Start Menu\Programs");
                if (Directory.Exists(startMenuPrograms))
                {
                    string startLnk = Path.Combine(startMenuPrograms, "Rishu Key Jutsu.lnk");
                    MakeShortcut(shell, shellType, startLnk, targetExe, iconPath, "Rishu Key Jutsu — Martial Arts Touch Typing Combat");
                }
            }
            catch { }
        }

        private static void MakeShortcut(object shell, Type shellType, string lnkPath, string targetExe, string iconPath, string desc)
        {
            try
            {
                object shortcut = shellType.InvokeMember("CreateShortcut", BindingFlags.InvokeMethod, null, shell, new object[] { lnkPath });
                if (shortcut != null)
                {
                    Type scType = shortcut.GetType();
                    scType.InvokeMember("TargetPath", BindingFlags.SetProperty, null, shortcut, new object[] { targetExe });
                    scType.InvokeMember("WorkingDirectory", BindingFlags.SetProperty, null, shortcut, new object[] { Path.GetDirectoryName(targetExe) });
                    if (File.Exists(iconPath))
                    {
                        scType.InvokeMember("IconLocation", BindingFlags.SetProperty, null, shortcut, new object[] { iconPath + ",0" });
                    }
                    scType.InvokeMember("Description", BindingFlags.SetProperty, null, shortcut, new object[] { desc });
                    scType.InvokeMember("Save", BindingFlags.InvokeMethod, null, shortcut, null);
                }
            }
            catch { }
        }

        private static void LaunchAppMode(string uri)
        {
            string[] candidates = new string[]
            {
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\Edge\Application\msedge.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\Edge\Application\msedge.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Microsoft\Edge\Application\msedge.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Google\Chrome\Application\chrome.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Google\Chrome\Application\chrome.exe")
            };

            string browserExe = null;
            foreach (string path in candidates)
            {
                if (File.Exists(path))
                {
                    browserExe = path;
                    break;
                }
            }

            if (browserExe != null)
            {
                ProcessStartInfo psi = new ProcessStartInfo();
                psi.FileName = browserExe;
                psi.Arguments = string.Format("--app=\"{0}\" --window-size=1280,760 --autoplay-policy=no-user-gesture-required", uri);
                psi.UseShellExecute = false;
                Process.Start(psi);
            }
            else
            {
                ProcessStartInfo psi = new ProcessStartInfo();
                psi.FileName = uri;
                psi.UseShellExecute = true;
                Process.Start(psi);
            }
        }
    }
}
