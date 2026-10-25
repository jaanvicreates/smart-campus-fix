$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$outDir = "C:\Users\Gangireddy Jahnavi\OneDrive\Desktop\Agile_project\screenshots"

$pages = @(
    @{ name = "03_student_dashboard.png"; url = "http://localhost:5000/dashboard?role=student" },
    @{ name = "04_report_form.png"; url = "http://localhost:5000/report?role=student" },
    @{ name = "05_my_complaints.png"; url = "http://localhost:5000/my-complaints?role=student" },
    @{ name = "06_complaint_detail.png"; url = "http://localhost:5000/complaints/SCF-2026-1001?role=student" },
    @{ name = "07_notifications.png"; url = "http://localhost:5000/notifications?role=student" },
    @{ name = "08_admin_dashboard.png"; url = "http://localhost:5000/admin?role=admin" },
    @{ name = "09_admin_assign_workspace.png"; url = "http://localhost:5000/admin/complaints?role=admin" },
    @{ name = "10_staff_dashboard.png"; url = "http://localhost:5000/staff?role=staff" }
)

foreach ($page in $pages) {
    $outFile = Join-Path $outDir $page.name
    $tmpFile = "C:\tmp\" + $page.name
    Write-Host "Capturing $($page.name)..."
    Start-Process -FilePath $edge -ArgumentList "--headless=new", "--window-size=1440,900", "--virtual-time-budget=2500", "--screenshot=$tmpFile", "--user-data-dir=C:\tmp\edge_shot_profile", $page.url -Wait
    if (Test-Path $tmpFile) {
        Copy-Item $tmpFile $outFile -Force
        Write-Host " Saved to $outFile"
    } else {
        Write-Warning " Failed to capture $tmpFile"
    }
}

Write-Host "All screenshots completed!"
