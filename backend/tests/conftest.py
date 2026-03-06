import sys
from pathlib import Path

# Add the parent directory (project root) to sys.path so 'backend' module can be found
sys.path.insert(0, str(Path(__file__).parent.parent.parent))
