using System;
using System.IO;
using System.Diagnostics;
using System.Windows.Forms;
using System.Runtime.InteropServices;
using System.Runtime.InteropServices.ComTypes;
using System.Text;

namespace RishuKeyJutsu
{
    // Native Windows COM interfaces for clean, safe .lnk shortcut creation
    [ComImport]
    [Guid("00021401-0000-0000-C000-000000000046")]
    internal class ShellLink { }

    [ComImport]
    [InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    [Guid("000214F9-0000-0000-C000-000000000046")]
    internal interface IShellLinkW
    {
        void GetPath([Out, MarshalAs(UnmanagedType.LPWStr)] StringBuilder pszFile, int cchMaxPath, out IntPtr pfd, int fFlags);
        void GetIDList(out IntPtr ppidl);
        void SetIDList(IntPtr pidl);
        void GetDescription([Out, MarshalAs(UnmanagedType.LPWStr)] StringBuilder pszName, int cchMaxName);
        void SetDescription([MarshalAs(UnmanagedType.LPWStr)] string pszName);
        void GetWorkingDirectory([Out, MarshalAs(UnmanagedType.LPWStr)] StringBuilder pszDir, int cchMaxPath);
        void SetWorkingDirectory([MarshalAs(UnmanagedType.LPWStr)] string pszDir);
        void GetArguments([Out, MarshalAs(UnmanagedType.LPWStr)] StringBuilder pszArgs, int cchMaxPath);
        void SetArguments([MarshalAs(UnmanagedType.LPWStr)] string pszArgs);
        void GetHotkey(out short pwHotkey);
        void SetHotkey(short wHotkey);
        void GetShowCmd(out int piShowCmd);
        void SetShowCmd(int iShowCmd);
        void GetIconLocation([Out, MarshalAs(UnmanagedType.LPWStr)] StringBuilder pszIconPath, int cchIconPath, out int piIcon);
        void SetIconLocation([MarshalAs(UnmanagedType.LPWStr)] string pszIconPath, int iIcon);
        void SetRelativePath([MarshalAs(UnmanagedType.LPWStr)] string pszPathRel, int dwReserved);
        void Resolve(IntPtr hwnd, int fFlags);
        void SetPath([MarshalAs(UnmanagedType.LPWStr)] string pszFile);
    }

    static class Program
    {
        [STAThread]
        static void Main()
        {
            try
            {
                string baseDir = AppDomain.CurrentDomain.BaseDirectory;
                string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
                string installDir = Path.Combine(localAppData, "RishuKeyJutsu");
                string installedExe = Path.Combine(installDir, "RishuKeyJutsu.exe");
                string installedHtml = Path.Combine(installDir, "play.html");
                string installedIcon = Path.Combine(installDir, "assets", "app_icon.ico");

                // Check where source files are located
                string sourceHtml = Path.Combine(baseDir, "play.html");
                string sourceDir = baseDir;

                if (!File.Exists(sourceHtml))
                {
                    try
                    {
                        DirectoryInfo parent = Directory.GetParent(baseDir);
                        if (parent != null && File.Exists(Path.Combine(parent.FullName, "play.html")))
                        {
                            sourceDir = parent.FullName;
                            sourceHtml = Path.Combine(sourceDir, "play.html");
                        }
                    }
                    catch { }
                }

                // Auto-install to LocalAppData if running from an unzipped / downloaded folder
                if (File.Exists(sourceHtml) && !string.Equals(sourceDir.TrimEnd('\\'), installDir.TrimEnd('\\'), StringComparison.OrdinalIgnoreCase))
                {
                    try
                    {
                        CopyDirectory(sourceDir, installDir);
                    }
                    catch { }
                }

                // Ensure the running executable is copied into the permanent installation folder
                try
                {
                    string currentExe = Process.GetCurrentProcess().MainModule.FileName;
                    if (File.Exists(currentExe) && !string.Equals(currentExe, installedExe, StringComparison.OrdinalIgnoreCase))
                    {
                        if (!Directory.Exists(installDir))
                        {
                            Directory.CreateDirectory(installDir);
                        }
                        File.Copy(currentExe, installedExe, true);
                    }
                }
                catch { }

                // Create official Desktop and Start Menu shortcuts
                string targetExeForShortcut = File.Exists(installedExe) ? installedExe : Process.GetCurrentProcess().MainModule.FileName;
                string targetIconForShortcut = File.Exists(installedIcon) ? installedIcon : Path.Combine(baseDir, "assets", "app_icon.ico");

                try
                {
                    string desktopDir = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
                    if (Directory.Exists(desktopDir))
                    {
                        string desktopLnk = Path.Combine(desktopDir, "Rishu Key Jutsu.lnk");
                        if (!File.Exists(desktopLnk))
                        {
                            CreateShellShortcut(targetExeForShortcut, desktopLnk, targetIconForShortcut, "Rishu Key Jutsu — Martial Arts Touch Typing Combat");
                        }
                    }

                    string startMenuDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.StartMenu), "Programs");
                    if (Directory.Exists(startMenuDir))
                    {
                        string startMenuLnk = Path.Combine(startMenuDir, "Rishu Key Jutsu.lnk");
                        if (!File.Exists(startMenuLnk))
                        {
                            CreateShellShortcut(targetExeForShortcut, startMenuLnk, targetIconForShortcut, "Rishu Key Jutsu — Martial Arts Touch Typing Combat");
                        }
                    }
                }
                catch { }

                // Determine target game HTML to open
                string launchHtml = null;
                if (File.Exists(installedHtml))
                {
                    launchHtml = installedHtml;
                }
                else if (File.Exists(sourceHtml))
                {
                    launchHtml = sourceHtml;
                }

                string targetUri;
                if (launchHtml != null && File.Exists(launchHtml))
                {
                    targetUri = "file:///" + launchHtml.Replace('\\', '/');
                }
                else
                {
                    targetUri = "https://keyjutsu-game.vercel.app/play.html";
                }

                // Search for system browser to launch in dedicated app window
                string[] browserCandidates = new string[]
                {
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\Edge\Application\msedge.exe"),
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\Edge\Application\msedge.exe"),
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Microsoft\Edge\Application\msedge.exe"),
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Google\Chrome\Application\chrome.exe"),
                    Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Google\Chrome\Application\chrome.exe")
                };

                string browserExe = null;
                foreach (string path in browserCandidates)
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
                    psi.Arguments = string.Format("--app=\"{0}\" --window-size=1280,760 --autoplay-policy=no-user-gesture-required", targetUri);
                    psi.UseShellExecute = false;
                    Process.Start(psi);
                }
                else
                {
                    ProcessStartInfo psi = new ProcessStartInfo();
                    psi.FileName = targetUri;
                    psi.UseShellExecute = true;
                    Process.Start(psi);
                }
            }
            catch (Exception ex)
            {
                try
                {
                    Process.Start(new ProcessStartInfo("https://keyjutsu-game.vercel.app/play.html") { UseShellExecute = true });
                }
                catch
                {
                    MessageBox.Show("Error launching Rishu Key Jutsu:\n" + ex.Message, "Rishu Key Jutsu", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
            }
        }

        static void CopyDirectory(string sourceDir, string destDir)
        {
            if (!Directory.Exists(destDir))
            {
                Directory.CreateDirectory(destDir);
            }

            foreach (string file in Directory.GetFiles(sourceDir))
            {
                string fileName = Path.GetFileName(file);
                // Do not copy zip archives or temp files into installed folder
                if (fileName.EndsWith(".zip", StringComparison.OrdinalIgnoreCase)) continue;

                string destFile = Path.Combine(destDir, fileName);
                try
                {
                    File.Copy(file, destFile, true);
                }
                catch { }
            }

            foreach (string dir in Directory.GetDirectories(sourceDir))
            {
                string dirName = Path.GetFileName(dir);
                if (dirName.StartsWith(".") || dirName.Equals("downloads", StringComparison.OrdinalIgnoreCase)) continue;

                CopyDirectory(dir, Path.Combine(destDir, dirName));
            }
        }

        static void CreateShellShortcut(string targetPath, string shortcutPath, string iconPath, string description)
        {
            try
            {
                IShellLinkW link = (IShellLinkW)new ShellLink();
                link.SetDescription(description);
                link.SetPath(targetPath);
                link.SetWorkingDirectory(Path.GetDirectoryName(targetPath));

                if (File.Exists(iconPath))
                {
                    link.SetIconLocation(iconPath, 0);
                }

                IPersistFile file = (IPersistFile)link;
                file.Save(shortcutPath, false);
            }
            catch { }
        }
    }
}
