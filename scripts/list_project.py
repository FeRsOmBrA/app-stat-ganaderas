import os

def list_directories(base_path, indent_level=0):
    """
    Lists all directories and files in the given base path with recursion, except for 'node_modules' and '.git',
    in a tree-like structure.

    Parameters:
        base_path (str): The path to the base directory.
        indent_level (int): The current level of indentation (used for recursion).
    """
    try:
        for root, dirs, files in os.walk(base_path):
            # Skip 'node_modules' and '.git' directories
            dirs[:] = [d for d in dirs if d not in ['node_modules', '.git']]
            for dir_name in dirs:
                print(' ' * indent_level * 2 + '|-- ' + dir_name)
                list_directories(os.path.join(root, dir_name), indent_level + 1)
            for file_name in files:
                print(' ' * indent_level * 2 + '|-- ' + file_name)
            break  # Prevents os.walk from going into subdirectories automatically
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    base_path = "C:/Users/ferne/Work/projecto-ganaderia/app-stat-ganaderas"
    list_directories(base_path)