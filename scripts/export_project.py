import os
import zipfile
from datetime import datetime
import shutil


def export_react_native_project(project_path):
    # Exclusion patterns
    exclude_patterns = [
        'node_modules',
        '.git',
        '.gradle',
        'build',
        '.idea',
        '__pycache__',
        '.expo',
        'android/app/build',
        'ios/Pods',
        '*.log',
        '*.zip'
    ]

    try:
        # Create timestamp for unique zip name
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        zip_filename = f"rn_project_backup_{timestamp}.zip"

        # Create zip file
        with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(project_path):
                # Remove excluded directories
                dirs[:] = [d for d in dirs if not any(
                    pat in d for pat in exclude_patterns)]

                for file in files:
                    # Skip excluded files
                    if any(pat in file for pat in exclude_patterns):
                        continue

                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, project_path)

                    try:
                        zipf.write(file_path, arcname)
                        print(f"Added: {arcname}")
                    except Exception as e:
                        print(f"Error adding {arcname}: {str(e)}")

        print(f"\nProject exported successfully to {zip_filename}")
        print(f"Zip file size: {os.path.getsize(
            zip_filename) / (1024*1024):.2f} MB")

    except Exception as e:
        print(f"Export failed: {str(e)}")


if __name__ == "__main__":
    # Get current directory as default project path
    project_dir = os.getcwd()
    export_react_native_project(project_dir)
