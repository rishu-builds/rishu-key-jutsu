using System;
using System.IO;
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
                string baseDir = AppDomain.CurrentDomain.BaseDirectory;
                string htmlPath = Path.Combine(baseDir, "play.html");

                // If not found in current folder (e.g. run inside WinRAR temp folder)
                if (!File.Exists(htmlPath))
                {
                    // Search parent directories
                    try
                    {
                        DirectoryInfo parent = Directory.GetParent(baseDir);
                        if (parent != null && File.Exists(Path.Combine(parent.FullName, "play.html")))
                        {
                            htmlPath = Path.Combine(parent.FullName, "play.html");
                        }
                    }
                    catch { }

                    // Search common local locations
                    if (!File.Exists(htmlPath))
                    {
                        string userProfile = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
                        string[] searchCandidates = new string[]
                        {
                            Path.Combine(userProfile, @"Desktop\Rishu-KeyJutsu\play.html"),
                            Path.Combine(userProfile, @"Downloads\Rishu-KeyJutsu-Windows-v1.0.0\play.html"),
                            Path.Combine(userProfile, @"Desktop\Rishu-KeyJutsu-Windows-v1.0.0\play.html"),
                            Path.Combine(userProfile, @"Downloads\keyjutsu-web\play.html")
                        };

                        foreach (string cand in searchCandidates)
                        {
                            if (File.Exists(cand))
                            {
                                htmlPath = cand;
                                break;
                            }
                        }
                    }
                }

                if (!File.Exists(htmlPath))
                {
                    MessageBox.Show(
                        "Kripya ZIP file ko pehle EXTRACT (Unzip) karein, fir RishuKeyJutsu.exe chalayein!\n\n" +
                        "How to play:\n" +
                        "1. Zip file par Right-Click karein\n" +
                        "2. 'Extract All' ya 'Extract Here' chunein\n" +
                        "3. Naye folder me se 'RishuKeyJutsu.exe' open karein.",
                        "Rishu Key Jutsu — Extract Required",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Information
                    );
                    return;
                }

                string fileUri = "file:///" + htmlPath.Replace('\\', '/');

                string[] candidateExecutables = new string[]
                {
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\Edge\Application\msedge.exe"),
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\Edge\Application\msedge.exe"),
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Microsoft\Edge\Application\msedge.exe"),
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Google\Chrome\Application\chrome.exe"),
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Google\Chrome\Application\chrome.exe")
                };

                string browserAppExe = null;
                foreach (string loc in candidateExecutables)
                {
                    if (File.Exists(loc))
                    {
                        browserAppExe = loc;
                        break;
                    }
                }

                if (browserAppExe != null)
                {
                    ProcessStartInfo psi = new ProcessStartInfo();
                    psi.FileName = browserAppExe;
                    psi.Arguments = string.Format("--app=\"{0}\" --window-size=1280,760 --autoplay-policy=no-user-gesture-required", fileUri);
                    psi.UseShellExecute = false;
                    Process.Start(psi);
                }
                else
                {
                    ProcessStartInfo psi = new ProcessStartInfo();
                    psi.FileName = htmlPath;
                    psi.UseShellExecute = true;
                    Process.Start(psi);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error launching Rishu Key Jutsu:\n" + ex.Message, "Rishu Key Jutsu", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}
