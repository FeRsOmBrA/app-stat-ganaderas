import os
import tkinter as tk
from tkinter import filedialog


def merge_text_files(folder_path, output_file):
    """
    Merges all text files in a given folder and its subfolders into a single organized and readable file.
    Includes the full path of each file being merged.

    Parameters:
        folder_path (str): The path to the folder containing text files.
        output_file (str): The path for the output merged file.
    """
    try:
        with open(output_file, 'w', encoding='latin1') as outfile:
            for root, dirs, files in os.walk(folder_path):
                for filename in sorted(files):
                    file_path = os.path.join(root, filename)

                    # Check if it's a text file with desired extensions
                    if filename.lower().endswith(('.txt', '.ts', '.tsx', '.js')):
                        header = f"\n{'='*20} {file_path} {'='*20}\n"
                        outfile.write(header)

                        # Read the file content and append to the output file
                        try:
                            with open(file_path, 'r', encoding='latin1') as infile:
                                content = infile.read()
                                outfile.write(content)
                                # Add a newline for separation
                                outfile.write('\n')
                        except Exception as e:
                            outfile.write(f"Error reading {
                                          file_path}: {e}\n\n")

        print(f"Files merged successfully into {output_file}")
    except Exception as e:
        print(f"An error occurred while merging files: {e}")


def ask_directory():
    """
    Prompts the user to select a directory using a graphical file dialog.
    """
    root = tk.Tk()
    root.withdraw()  # Hide the root window
    folder_path = filedialog.askdirectory(
        title="Select Folder to Merge Text Files")
    return folder_path


def ask_output_file():
    """
    Prompts the user to select an output file path using a graphical file dialog.
    """
    root = tk.Tk()
    root.withdraw()  # Hide the root window
    output_file = filedialog.asksaveasfilename(
        defaultextension=".txt",
        filetypes=[("Text files", "*.txt"), ("All files", "*.*")]
    )
    return output_file


# Example usage
if __name__ == "__main__":
    folder_path = ask_directory()
    if folder_path:
        output_file = ask_output_file()
        if output_file:
            merge_text_files(folder_path, output_file)
        else:
            print("No output file selected.")
    else:
        print("No directory selected.")
